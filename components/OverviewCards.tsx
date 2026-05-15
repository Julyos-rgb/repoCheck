"use client";

import type { RepoInfo } from "@/types";

interface OverviewCardsProps {
  repoInfo: RepoInfo;
}

const cards = [
  {
    key: "stargazers_count" as const,
    label: "Stars",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    color: "from-yellow-400/20 to-yellow-600/5",
    border: "border-yellow-500/30",
    glow: "shadow-yellow-500/10",
    text: "text-yellow-400",
  },
  {
    key: "forks_count" as const,
    label: "Forks",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M5.5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm13 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm-13 9a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm13 0a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM7.5 7.5v2.81c1.14.36 2.01 1.28 2.31 2.44h4.38c.3-1.16 1.17-2.08 2.31-2.44V7.5" />
      </svg>
    ),
    color: "from-cyan-400/20 to-cyan-600/5",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/10",
    text: "text-cyan-400",
  },
  {
    key: "watchers_count" as const,
    label: "Watchers",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    ),
    color: "from-purple-400/20 to-purple-600/5",
    border: "border-purple-500/30",
    glow: "shadow-purple-500/10",
    text: "text-purple-400",
  },
  {
    key: "open_issues_count" as const,
    label: "Open Issues",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
    color: "from-blue-400/20 to-blue-600/5",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/10",
    text: "text-blue-400",
  },
];

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

export default function OverviewCards({ repoInfo }: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`relative overflow-hidden rounded-xl border ${card.border} bg-gradient-to-br ${card.color} backdrop-blur-sm p-5 shadow-lg ${card.glow} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={card.text}>{card.icon}</span>
            <span className="text-sm text-zinc-400 font-medium">{card.label}</span>
          </div>
          <div className={`text-3xl font-bold ${card.text} tracking-tight`}>
            {formatNumber(repoInfo[card.key])}
          </div>
        </div>
      ))}
    </div>
  );
}
