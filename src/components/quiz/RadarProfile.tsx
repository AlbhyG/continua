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

// Custom tick renderer that wraps multi-word labels onto two lines.
// Recharts passes {payload, x, y, textAnchor, ...} to the tick component.
interface TickProps {
  payload?: { value: string };
  x?: number;
  y?: number;
  textAnchor?: "inherit" | "end" | "start" | "middle";
}

function wrapLabel(raw: string): string[] {
  // Split on en-dash or space; keep hyphenated compounds together.
  if (raw.includes("–")) return raw.split("–").map((s) => s.trim());
  if (raw.includes(" ")) return raw.split(/\s+/);
  return [raw];
}

function WrappingTick(props: TickProps) {
  const { payload, x = 0, y = 0, textAnchor = "middle" } = props;
  const lines = wrapLabel(payload?.value || "");
  return (
    <text x={x} y={y} textAnchor={textAnchor} fontSize={11} fill="rgba(0,0,0,0.6)">
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 13}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

export default function RadarProfile({ data }: { data: AxisResult[] }) {
  const chartData = data.map((ar) => ({
    axis: ar.name,
    score: ar.score,
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart
        cx="50%"
        cy="50%"
        outerRadius="62%"
        data={chartData}
        margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
      >
        <PolarGrid stroke="rgba(0,0,0,0.08)" gridType="polygon" />
        <PolarAngleAxis dataKey="axis" tick={<WrappingTick />} />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fontSize: 9, fill: "rgba(0,0,0,0.25)" }}
          tickCount={6}
          stroke="rgba(0,0,0,0.05)"
        />
        <Radar
          name="Profile"
          dataKey="score"
          stroke="rgba(67,117,237,0.8)"
          fill="rgba(67,117,237,0.15)"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: "rgb(67,117,237)",
            stroke: "white",
            strokeWidth: 2,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
