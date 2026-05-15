"use client";

import type { AIScoreResult } from "@/types";

const DIMENSION_NAMES: Record<string, string> = {
  activity: "代码活跃度",
  community: "社区健康度",
  documentation: "文档完善度",
  engineering: "工程规范度",
  ecosystem: "技术生态度",
  sustainability: "维护可持续性",
};

interface AIScoreCardProps {
  repoInfo: { full_name: string };
  aiScore: AIScoreResult | null;
  loading: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 70) return "#3b82f6";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "优秀";
  if (score >= 70) return "良好";
  if (score >= 50) return "一般";
  return "待改进";
}

function getScoreRingGradient(score: number): { stroke: string; glow: string } {
  if (score >= 90) return { stroke: "#22c55e", glow: "rgba(34,197,94,0.3)" };
  if (score >= 70) return { stroke: "#3b82f6", glow: "rgba(59,130,246,0.3)" };
  if (score >= 50) return { stroke: "#eab308", glow: "rgba(234,179,8,0.3)" };
  return { stroke: "#ef4444", glow: "rgba(239,68,68,0.3)" };
}

function ScoreRing({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const offset = circumference - progress;
  const { stroke, glow } = getScoreRingGradient(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s ease-in-out",
            filter: `drop-shadow(0 0 8px ${glow})`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="text-5xl font-bold tracking-tight"
          style={{ color: stroke }}
        >
          {score}
        </span>
        <span
          className="mt-1 text-sm font-medium"
          style={{ color: `${stroke}cc` }}
        >
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}

function DimensionCard({
  name,
  score,
  comment,
}: {
  name: string;
  score: number;
  comment: string;
}) {
  const displayScore = score * 5;
  const color = getScoreColor(displayScore);
  const barWidth = Math.min(displayScore, 100);
  const label = DIMENSION_NAMES[name] || name;

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111827]/80 p-4 backdrop-blur-sm transition-colors hover:border-white/[0.12]">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>
          {displayScore}
          <span className="ml-0.5 text-xs text-gray-500">/100</span>
        </span>
      </div>
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${barWidth}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
      <p className="text-xs leading-relaxed text-gray-400">{comment}</p>
    </div>
  );
}

export default function AIScoreCard({
  repoInfo,
  aiScore,
  loading,
}: AIScoreCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="mb-4 h-10 w-10 animate-spin text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="60 30"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-lg font-medium text-gray-300">
            AI 正在分析中...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            正在深度分析 {repoInfo.full_name} 的仓库数据
          </p>
        </div>
      </div>
    );
  }

  if (!aiScore) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <svg
            className="mb-4 h-10 w-10 text-gray-600"
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
          <p className="text-lg font-medium text-gray-400">
            AI 评分暂时不可用
          </p>
          <p className="mt-2 text-sm text-gray-500">
            请稍后再试或检查 API 配置
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6 sm:p-8">
      <h2 className="mb-6 text-center text-xl font-semibold tracking-wide text-gray-100 sm:text-2xl">
        AI 综合评分
      </h2>

      <div className="mb-8 flex justify-center">
        <ScoreRing score={aiScore.total_score} />
      </div>

      <div className="mb-8 rounded-xl border border-white/[0.06] bg-[#111827]/60 p-5">
        <h3 className="mb-3 text-sm font-medium tracking-wider text-gray-400 uppercase">
          AI 总结评语
        </h3>
        <p className="text-sm leading-relaxed text-gray-300">
          {aiScore.summary}
        </p>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 text-sm font-medium tracking-wider text-gray-400 uppercase">
          各维度评分
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiScore.dimensions.map((dim) => (
            <DimensionCard
              key={dim.name}
              name={dim.name}
              score={dim.score}
              comment={dim.comment}
            />
          ))}
        </div>
      </div>

      {aiScore.suggestions.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-medium tracking-wider text-gray-400 uppercase">
            改进建议
          </h3>
          <ul className="space-y-3">
            {aiScore.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-start gap-3 rounded-lg border border-white/[0.04] bg-[#111827]/40 px-4 py-3"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2a1 1 0 011 1v1.07A7.002 7.002 0 0118.93 10H20a1 1 0 110 2h-1.07A7.002 7.002 0 0113 18.93V20a1 1 0 11-2 0v-1.07A7.002 7.002 0 017.07 12H6a1 1 0 110-2h1.07A7.002 7.002 0 0111 4.07V3a1 1 0 011-1zm-1 5a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6z" />
                </svg>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-xs font-bold text-gray-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-gray-300">
                    {suggestion}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
