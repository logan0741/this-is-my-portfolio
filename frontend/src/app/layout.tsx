import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "김건희 포트폴리오 | Portfolio",
  description:
    "전남대학교 인공지능학부 인공지능전공 김건희의 포트폴리오 웹사이트",
  keywords: ["포트폴리오", "김건희", "전남대", "인공지능", "개발자"],
  openGraph: {
    title: "김건희 포트폴리오",
    description: "대학생활에서 얻는 경험과 감정들의 기록",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
