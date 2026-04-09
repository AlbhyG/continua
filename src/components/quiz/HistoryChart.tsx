"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistoryEntry {
  id: number;
  questionnaire_id: number;
  score: number;
  taken_at: string;
}

export default function HistoryChart({ data }: { data: HistoryEntry[] }) {
  const chartData = data.map((entry) => ({
    date: new Date(entry.taken_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    score: entry.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
          stroke="rgba(255,255,255,0.1)"
        />
        <YAxis
          domain={[1, 10]}
          ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
          stroke="rgba(255,255,255,0.1)"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0,0,0,0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            fontSize: "14px",
            color: "white",
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="white"
          strokeWidth={2}
          dot={{ fill: "white", strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6, fill: "white" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
