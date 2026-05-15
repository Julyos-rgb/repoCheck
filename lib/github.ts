import type {
  RepoInfo,
  Language,
  Contributor,
  CommitInfo,
  RepoExtras,
  CommitActivity,
} from "@/types";

const GITHUB_API_BASE = "https://api.github.com";

class GitHubApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "GitHubApiError";
  }
}

async function githubFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "repo-check-app",
    },
  });

  if (!response.ok) {
    switch (response.status) {
      case 404:
        throw new GitHubApiError(404, "仓库不存在");
      case 403:
        throw new GitHubApiError(403, "API 请求过于频繁");
      default:
        throw new GitHubApiError(
          response.status,
          `GitHub API 请求失败: ${response.status} ${response.statusText}`,
        );
    }
  }

  return response.json() as Promise<T>;
}

async function githubHead(url: string): Promise<boolean> {
  const response = await fetch(url, {
    method: "HEAD",
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "repo-check-app",
    },
  });

  return response.ok;
}

interface GitHubRepoApiResponse {
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

export async function fetchRepoInfo(
  owner: string,
  repo: string,
): Promise<RepoInfo> {
  const data = await githubFetch<GitHubRepoApiResponse>(
    `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  );

  return {
    name: data.name,
    full_name: data.full_name,
    description: data.description,
    html_url: data.html_url,
    stargazers_count: data.stargazers_count,
    forks_count: data.forks_count,
    open_issues_count: data.open_issues_count,
    watchers_count: data.watchers_count,
    language: data.language,
    created_at: data.created_at,
    updated_at: data.updated_at,
    pushed_at: data.pushed_at,
    default_branch: data.default_branch,
    license: data.license,
    topics: data.topics,
    archived: data.archived,
    size: data.size,
  };
}

interface GitHubLanguagesApiResponse {
  [language: string]: number;
}

export async function fetchLanguages(
  owner: string,
  repo: string,
): Promise<Language[]> {
  const data = await githubFetch<GitHubLanguagesApiResponse>(
    `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`,
  );

  const entries = Object.entries(data);
  const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0);

  if (totalBytes === 0) {
    return [];
  }

  return entries.map(([name, size]) => ({
    name,
    size,
    percentage: Math.round((size / totalBytes) * 10000) / 100,
  }));
}

interface GitHubContributorApiResponse {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export async function fetchContributors(
  owner: string,
  repo: string,
): Promise<Contributor[]> {
  const data = await githubFetch<GitHubContributorApiResponse[]>(
    `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=10`,
  );

  return data.map((item) => ({
    id: item.id,
    login: item.login,
    avatar_url: item.avatar_url,
    html_url: item.html_url,
    contributions: item.contributions,
  }));
}

interface GitHubCommitAuthor {
  name?: string;
  date?: string;
}
interface GitHubCommitAuthorInfo {
  login?: string;
  avatar_url?: string;
}
interface GitHubCommitData {
  sha: string;
  commit: {
    message: string;
    author: GitHubCommitAuthor;
  };
  author: GitHubCommitAuthorInfo | null;
  html_url: string;
}

export async function fetchRecentCommits(
  owner: string,
  repo: string,
): Promise<CommitInfo[]> {
  const data = await githubFetch<GitHubCommitData[]>(
    `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=20`,
  );

  return data.map((item) => ({
    sha: item.sha,
    message: item.commit.message,
    author_name: item.commit.author?.name ?? "Unknown",
    author_date: item.commit.author?.date ?? "",
    author_avatar_url: item.author?.avatar_url ?? null,
    url: item.html_url,
  }));
}

interface GitHubContentItem {
  name: string;
  type: string;
}

export async function fetchRepoExtras(
  owner: string,
  repo: string,
): Promise<RepoExtras> {
  const repoUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;

  const [hasReadme, hasContributing, hasLicense] = await Promise.all([
    githubHead(`${repoUrl}/readme`),
    githubHead(`${repoUrl}/contents/CONTRIBUTING.md`),
    githubHead(`${repoUrl}/contents/LICENSE`),
  ]);

  let hasCI = false;
  try {
    const contents = await githubFetch<GitHubContentItem[]>(
      `${repoUrl}/contents/.github/workflows`,
    );
    hasCI = contents.some(
      (item) => item.type === "file" && item.name.endsWith(".yml"),
    );
  } catch {
    hasCI = false;
  }

  return {
    hasReadme,
    hasCI,
    hasContributing,
    hasLicense,
  };
}

export async function fetchCommitActivity(
  owner: string,
  repo: string,
): Promise<CommitActivity[]> {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceISO = since.toISOString();

  const data = await githubFetch<GitHubCommitData[]>(
    `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=100&since=${encodeURIComponent(sinceISO)}`,
  );

  const activityMap = new Map<string, number>();

  for (const commit of data) {
    const dateStr = commit.commit.author?.date;
    if (!dateStr) continue;

    const date = dateStr.split("T")[0];
    if (!date) continue;

    activityMap.set(date, (activityMap.get(date) ?? 0) + 1);
  }

  const result: CommitActivity[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().split("T")[0];
    result.push({
      date: key ?? "",
      count: activityMap.get(key ?? "") ?? 0,
    });
  }

  return result;
}

export { GITHUB_API_BASE, GitHubApiError };
