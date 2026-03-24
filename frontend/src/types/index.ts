// 통일 데이터 스키마 - JSON & DB 공용
export interface Activity {
  id: string;
  year: number;
  term: string;
  category: string;
  roles: string[];
  title: string;
  is_awarded: boolean;
  award_title: string | null;
  github_url: string | null;
  readme_content: string | null;
  reflection: string;
  images: string[];
  certificates: string[];
}

export type ViewMode = "date" | "purpose" | null;

// 날짜별 보기용 트리 구조
export interface YearGroup {
  year: number;
  terms: TermGroup[];
}

export interface TermGroup {
  term: string;
  activities: Activity[];
}

// 목적성별 보기용 트리 구조
export interface CategoryGroup {
  category: string;
  activities: Activity[];
}

// 사이드바 통계
export interface PortfolioStats {
  totalActivities: number;
  totalAwards: number;
  roleDistribution: Record<string, number>;
  githubLinks: { title: string; url: string }[];
}
