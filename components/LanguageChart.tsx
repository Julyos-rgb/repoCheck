"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Language } from "@/types";

interface LanguageChartProps {
  languages: Language[];
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f97316",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: Language;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  return (
    <div className="bg-zinc-900/95 border border-zinc-700/50 rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-sm font-semibold text-white">{data.name}</p>
      <p className="text-sm text-zinc-400">
        占比：<span className="text-cyan-400 font-medium">{data.payload.percentage.toFixed(1)}%</span>
      </p>
      <p className="text-sm text-zinc-400">
        大小：<span className="text-purple-400 font-medium">{(data.value / 1024).toFixed(1)} KB</span>
      </p>
    </div>
  );
}

interface CustomLegendProps {
  payload?: Array<{ value: string; color: string }>;
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-zinc-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function LanguageChart({ languages }: LanguageChartProps) {
  if (!languages || languages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        暂无语言数据
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={languages}
          dataKey="size"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={100}
          innerRadius={55}
          paddingAngle={2}
          stroke="none"
        >
          {languages.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
