"use client";

import type { Contributor } from "@/types";

interface ContributorChartProps {
  contributors: Contributor[];
}

export default function ContributorChart({ contributors }: ContributorChartProps) {
  if (!contributors || contributors.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        暂无贡献者数据
      </div>
    );
  }

  const maxContributions = Math.max(...contributors.map((c) => c.contributions));

  return (
    <div className="space-y-3">
      {contributors.map((contributor, index) => {
        const percentage = (contributor.contributions / maxContributions) * 100;
        const gradientIndex = index % 4;
        const gradients = [
          "from-blue-500 to-cyan-400",
          "from-purple-500 to-blue-400",
          "from-cyan-500 to-teal-400",
          "from-indigo-500 to-purple-400",
        ];

        return (
          <div key={contributor.id} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={contributor.avatar_url}
                  alt={contributor.login}
                  className="w-6 h-6 rounded-full ring-1 ring-zinc-700/50"
                />
                <a
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-300 hover:text-cyan-400 transition-colors font-medium"
                >
                  {contributor.login}
                </a>
              </div>
              <span className="text-sm text-zinc-500 font-mono tabular-nums">
                {contributor.contributions}
                <span className="text-zinc-600 ml-1 text-xs">commits</span>
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${gradients[gradientIndex]} rounded-full transition-all duration-500 ease-out opacity-80 group-hover:opacity-100`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
