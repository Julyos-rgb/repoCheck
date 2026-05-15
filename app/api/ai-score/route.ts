import { NextResponse } from "next/server";
import { generateAIScore } from "@/lib/ai";
import type { RepoAnalysis, AIScoreResult } from "@/types";

export async function POST(request: Request) {
  try {
    const body: RepoAnalysis = await request.json();

    const result: AIScoreResult | null = await generateAIScore({
      repoInfo: body.repo_info,
      languages: body.languages,
      contributors: body.contributors,
      recentCommits: body.recent_commits,
      extras: body.extras,
      healthScores: body.health_scores,
    });

    if (!result) {
      return NextResponse.json(
        { error: "AI 评分暂时不可用" },
        { status: 503 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI score failed:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
