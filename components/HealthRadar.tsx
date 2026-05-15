"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { HealthScore } from "@/types";

interface HealthRadarProps {
  scores: HealthScore[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: HealthScore;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-zinc-900/95 border border-zinc-700/50 rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm max-w-[220px]">
      <p className="text-sm font-semibold text-white mb-1">{data.label}</p>
      <p className="text-sm text-cyan-400 mb-1">
        得分：<span className="font-bold">{data.score}</span>
        <span className="text-zinc-500"> / 100</span>
      </p>
      <p className="text-xs text-zinc-400 leading-relaxed">{data.description}</p>
    </div>
  );
}

export default function HealthRadar({ scores }: HealthRadarProps) {
  if (!scores || scores.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        暂无健康度评分数据
      </div>
    );
  }

  const data = scores.map((s) => ({
    ...s,
    fullMark: 100,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#1e293b" strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="label"
          tick={{ fill: "#a1a1aa", fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "#52525b", fontSize: 10 }}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="健康度"
          dataKey="score"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
