"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { RepoAnalysis, AIScoreResult } from "@/types";
import { calculateTotalScore } from "@/lib/score";
import RepoHeader from "@/components/RepoHeader";
import OverviewCards from "@/components/OverviewCards";
import LanguageChart from "@/components/LanguageChart";
import ActivityChart from "@/components/ActivityChart";
import ContributorChart from "@/components/ContributorChart";
import HealthRadar from "@/components/HealthRadar";
import AIScoreCard from "@/components/AIScoreCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";

export default function CheckPage() {
  const params = useParams();
  const owner = params.owner as string;
  const repo = params.repo as string;

  const [data, setData] = useState<RepoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [aiScore, setAiScore] = useState<AIScoreResult | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    if (!owner || !repo) return;

    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetch(`/api/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body.error || "请求失败");
          });
        }
        return res.json();
      })
      .then((result: RepoAnalysis) => {
        if (controller.signal.aborted) return;
        setData(result);
        setLoading(false);
        fetchAIScore(result, controller.signal);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message || "获取仓库数据失败");
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [owner, repo]);

  const fetchAIScore = (analysis: RepoAnalysis, signal?: AbortSignal) => {
    setAiLoading(true);
    fetch("/api/ai-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analysis),
      signal,
    })
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((result: AIScoreResult | null) => {
        if (signal?.aborted) return;
        setAiScore(result);
        setAiLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setAiScore(null);
        setAiLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="max-w-md text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <h2 className="mb-2 text-xl font-semibold text-gray-200">
            加载失败
          </h2>
          <p className="mb-6 text-gray-400">{error}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            返回首页
          </a>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            新的体检
          </a>
        </div>

        <RepoHeader repoInfo={data.repo_info} />

        <OverviewCards repoInfo={data.repo_info} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-200">
              编程语言分布
            </h2>
            <LanguageChart languages={data.languages} />
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-200">
              近 30 天提交活跃度
            </h2>
            <ActivityChart activity={data.commit_activity} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-200">
              贡献者排行
            </h2>
            <ContributorChart contributors={data.contributors} />
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-200 flex items-center gap-3">
              仓库健康度
              {data.health_scores.length > 0 && (
                <span className="text-2xl font-bold text-cyan-400">
                  {calculateTotalScore(data.health_scores)}分
                </span>
              )}
            </h2>
            <HealthRadar scores={data.health_scores} />
          </div>
        </div>

        <AIScoreCard
          repoInfo={data.repo_info}
          aiScore={aiScore}
          loading={aiLoading}
        />

        <footer className="pb-8 text-center text-xs text-gray-600">
          RepoCheck — GitHub 仓库体检工具
        </footer>
      </div>
    </div>
  );
}
