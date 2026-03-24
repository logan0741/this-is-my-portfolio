import {
  Activity,
  YearGroup,
  TermGroup,
  CategoryGroup,
  PortfolioStats,
} from "@/types";

const TERM_ORDER = ["1학기", "여름방학", "2학기", "겨울방학"];

export async function fetchActivities(): Promise<Activity[]> {
  const isVercel = process.env.NEXT_PUBLIC_IS_VERCEL === "true";

  if (isVercel) {
    const res = await fetch("/data.json");
    if (!res.ok) throw new Error("Failed to fetch data.json");
    return res.json();
  }

  // Phase 2/3: Fetch from backend API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const res = await fetch(`${apiUrl}/api/portfolio`);
  if (!res.ok) throw new Error("Failed to fetch from API");
  const data = await res.json();
  return data;
}

export function groupByDate(activities: Activity[]): YearGroup[] {
  const yearMap = new Map<number, Map<string, Activity[]>>();

  activities.forEach((a) => {
    if (!yearMap.has(a.year)) yearMap.set(a.year, new Map());
    const termMap = yearMap.get(a.year)!;
    if (!termMap.has(a.term)) termMap.set(a.term, []);
    termMap.get(a.term)!.push(a);
  });

  return Array.from(yearMap.entries())
    .sort(([a], [b]) => b - a) // 최신 년도 먼저
    .map(([year, termMap]) => ({
      year,
      terms: Array.from(termMap.entries())
        .sort(
          ([a], [b]) => TERM_ORDER.indexOf(a) - TERM_ORDER.indexOf(b)
        )
        .map(
          ([term, acts]): TermGroup => ({
            term,
            activities: acts,
          })
        ),
    }));
}

export function groupByCategory(activities: Activity[]): CategoryGroup[] {
  const catMap = new Map<string, Activity[]>();

  activities.forEach((a) => {
    if (!catMap.has(a.category)) catMap.set(a.category, []);
    catMap.get(a.category)!.push(a);
  });

  return Array.from(catMap.entries())
    .sort(([, a], [, b]) => b.length - a.length) // 활동 많은 카테고리 먼저
    .map(([category, activities]) => ({
      category,
      activities,
    }));
}

export function computeStats(activities: Activity[]): PortfolioStats {
  const roleDistribution: Record<string, number> = {};
  const githubLinks: { title: string; url: string }[] = [];
  let totalAwards = 0;

  activities.forEach((a) => {
    if (a.is_awarded) totalAwards++;
    a.roles.forEach((role) => {
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });
    if (a.github_url) {
      githubLinks.push({ title: a.title, url: a.github_url });
    }
  });

  return {
    totalActivities: activities.length,
    totalAwards,
    roleDistribution,
    githubLinks,
  };
}

export function parseGithubName(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : url;
  } catch {
    return url;
  }
}
