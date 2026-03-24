import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for README content
const readmeCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 }
    );
  }

  // Validate GitHub URL
  let owner: string, repo: string;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") {
      return NextResponse.json(
        { error: "Only GitHub URLs are supported" },
        { status: 400 }
      );
    }
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }
    owner = parts[0];
    repo = parts[1];
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const cacheKey = `${owner}/${repo}`;

  // Check cache
  const cached = readmeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({
      content: cached.content,
      cached: true,
    });
  }

  // Fetch from GitHub API
  try {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3.raw",
      "User-Agent": "Portfolio-App",
    };

    // Add token if available (server-side only)
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const res = await fetch(apiUrl, { headers });

    if (res.status === 404) {
      return NextResponse.json(
        { error: "README not found" },
        { status: 404 }
      );
    }

    if (res.status === 403) {
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${res.status}` },
        { status: res.status }
      );
    }

    const content = await res.text();

    // Cache the result
    readmeCache.set(cacheKey, { content, timestamp: Date.now() });

    return NextResponse.json({
      content,
      cached: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch README from GitHub" },
      { status: 500 }
    );
  }
}
