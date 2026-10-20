"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";

interface HistoryEntry {
  id: number;
  questionnaire_id: number;
  score: number;
  scores: Partial<AxisScores> | null;
  taken_at: string;
}

const AXES = Object.keys(AXIS_INFO) as Array<keyof AxisScores>;

const COLORS: Record<keyof AxisScores, string> = {
  social_attunement: "#fcf050",
  empathy: "#abc854",
  self_orientation: "#933160",
  conscientiousness: "#14877c",
  agency: "#c13732",
  reactivity: "#d16539",
};

export default function HistoryChart({ data }: { data: HistoryEntry[] }) {
  const chartData = data.map((entry) => ({
    assessment: `#${entry.questionnaire_id} · ${new Date(entry.taken_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })}`,
    ...entry.scores,
    empathy: entry.scores?.empathy ?? entry.score,
  }));

  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 12, left: -14, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(25,25,25,0.1)" />
        <XAxis
          dataKey="assessment"
          tick={{ fontSize: 11, fill: "rgba(25,25,25,0.6)" }}
          stroke="rgba(25,25,25,0.12)"
        />
        <YAxis
          domain={[1, 10]}
          ticks={[1, 4, 7, 10]}
          tick={{ fontSize: 11, fill: "rgba(25,25,25,0.6)" }}
          stroke="rgba(25,25,25,0.12)"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "12px",
            fontSize: "14px",
            color: "#1f2430",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
        {AXES.map((axis) => (
          <Line
            key={axis}
            type="monotone"
            dataKey={axis}
            name={AXIS_INFO[axis].name}
            connectNulls
            stroke={COLORS[axis]}
            strokeWidth={2}
            dot={{ fill: COLORS[axis], strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
