"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface AxisResult {
  axis: string;
  name: string;
  score: number;
  label: string;
  highLabel: string;
  lowLabel: string;
}

export default function RadarProfile({ data }: { data: AxisResult[] }) {
  const chartData = data.map((ar) => ({
    axis: ar.name.replace("–", "\n"),
    score: ar.score,
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
        <PolarGrid
          stroke="rgba(255,255,255,0.1)"
          gridType="polygon"
        />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }}
          tickCount={6}
          stroke="rgba(255,255,255,0.05)"
        />
        <Radar
          name="Profile"
          dataKey="score"
          stroke="rgba(255,255,255,0.8)"
          fill="rgba(255,255,255,0.15)"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: "white",
            stroke: "rgba(255,255,255,0.8)",
            strokeWidth: 1,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
