import { NextResponse } from "next/server";
import {
  fetchRepoInfo,
  fetchLanguages,
  fetchContributors,
  fetchRecentCommits,
  fetchRepoExtras,
  fetchCommitActivity,
  GitHubApiError,
} from "@/lib/github";
import { calculateHealthScore } from "@/lib/score";
import type { RepoAnalysis } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "缺少 owner 或 repo 参数" },
      { status: 400 },
    );
  }

  try {
    const [repoInfo, languages, contributors, recentCommits, extras, commitActivity] =
      await Promise.all([
        fetchRepoInfo(owner, repo),
        fetchLanguages(owner, repo),
        fetchContributors(owner, repo),
        fetchRecentCommits(owner, repo),
        fetchRepoExtras(owner, repo),
        fetchCommitActivity(owner, repo),
      ]);

    const healthScores = calculateHealthScore({
      repoInfo,
      languages,
      contributors,
      extras,
      commitActivity,
    });

    const result: RepoAnalysis = {
      repo_info: repoInfo,
      languages,
      contributors,
      recent_commits: recentCommits,
      extras,
      health_scores: healthScores,
      commit_activity: commitActivity,
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    console.error("Failed to analyze repo:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
