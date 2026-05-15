"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { CommitActivity } from "@/types";

interface ActivityChartProps {
  activity: CommitActivity[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-zinc-900/95 border border-zinc-700/50 rounded-lg px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-sm font-semibold text-cyan-400">
        {payload[0].value} 次提交
      </p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function ActivityChart({ activity }: ActivityChartProps) {
  if (!activity || activity.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        暂无提交活动数据
      </div>
    );
  }

  const data = activity.map((item) => ({
    ...item,
    dateLabel: formatDate(item.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="dateLabel"
          tick={{ fill: "#71717a", fontSize: 12 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={{ stroke: "#334155" }}
        />
        <YAxis
          tick={{ fill: "#71717a", fontSize: 12 }}
          axisLine={{ stroke: "#334155" }}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(59, 130, 246, 0.08)" }} />
        <Bar
          dataKey="count"
          fill="url(#barGradient)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
