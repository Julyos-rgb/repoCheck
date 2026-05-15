export interface RepoInfo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
  license: {
    spdx_id: string;
    name: string;
    url: string | null;
  } | null;
  topics: string[];
  archived: boolean;
  size: number;
}

export interface Language {
  name: string;
  size: number;
  percentage: number;
}

export interface Contributor {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface CommitInfo {
  sha: string;
  message: string;
  author_name: string;
  author_date: string;
  author_avatar_url: string | null;
  url: string;
}

export interface RepoExtras {
  hasReadme: boolean;
  hasCI: boolean;
  hasContributing: boolean;
  hasLicense: boolean;
}

export interface CommitActivity {
  date: string;
  count: number;
}

export type HealthDimension =
  | "activity"
  | "community"
  | "documentation"
  | "engineering"
  | "ecosystem"
  | "sustainability";

export interface HealthScore {
  dimension: HealthDimension;
  label: string;
  score: number;
  description: string;
}

export interface RepoAnalysis {
  repo_info: RepoInfo;
  languages: Language[];
  contributors: Contributor[];
  recent_commits: CommitInfo[];
  extras: RepoExtras;
  health_scores: HealthScore[];
  commit_activity: CommitActivity[];
}

export interface AIScoreDimension {
  name: string;
  score: number;
  comment: string;
}

export interface AIScoreResult {
  total_score: number;
  summary: string;
  dimensions: AIScoreDimension[];
  suggestions: string[];
}

export interface APIError {
  code: number;
  message: string;
}
