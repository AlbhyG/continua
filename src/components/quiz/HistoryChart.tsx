"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { AXIS_INFO, type AxisScores } from "@/lib/quiz/scoring";
import { AXIS_COLORS } from "@/lib/quiz/axis-colors";

interface HistoryEntry {
  id: number;
  questionnaire_id: number;
  score: number;
  scores: Partial<AxisScores> | null;
  taken_at: string;
}

// Book order, used everywhere the six coordinates are listed.
const AXES = Object.keys(AXIS_INFO) as Array<keyof AxisScores>;

// No floating tooltip: on a phone it covered most of the chart and stayed
// pinned until you tapped elsewhere. Instead, tapping (or hovering) a point
// selects that assessment, and its values show in the panel under the chart,
// which also serves as the legend.
export default function HistoryChart({ data }: { data: HistoryEntry[] }) {
  const chartData = data.map((entry) => ({
    // Date and time, so two assessments on the same day are told apart.
    assessment: new Date(entry.taken_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    ...entry.scores,
    empathy: entry.scores?.empathy ?? entry.score,
  })) as Array<{ assessment: string } & Partial<Record<keyof AxisScores, number>>>;

  const lastIndex = chartData.length - 1;
  const [selected, setSelected] = useState(lastIndex);
  const current = chartData[Math.min(selected, lastIndex)];

  const select = (state: { activeTooltipIndex?: unknown } | null | undefined) => {
    const index = Number(state?.activeTooltipIndex);
    if (Number.isInteger(index) && index >= 0 && index <= lastIndex) setSelected(index);
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 12, left: -14, bottom: 5 }}
          onClick={select}
          onMouseMove={select}
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
          {/* Kept only so the chart tracks which point is under the finger. */}
          <Tooltip content={() => null} cursor={false} />
          {current && (
            <ReferenceLine x={current.assessment} stroke="rgba(25,25,25,0.35)" strokeWidth={1.5} />
          )}
          {AXES.map((axis) => (
            <Line
              key={axis}
              type="monotone"
              dataKey={axis}
              name={AXIS_INFO[axis].name}
              connectNulls
              stroke={AXIS_COLORS[axis]}
              strokeWidth={2}
              dot={{ fill: AXIS_COLORS[axis], strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {current && (
        <div className="mt-3 border-t border-foreground/10 pt-3">
          <p className="text-sm font-bold text-foreground/70">
            {selected === lastIndex ? "Latest" : "Selected"}: {current.assessment}
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
            {AXES.map((axis) => {
              const value = current[axis];
              return (
                <li key={axis} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: AXIS_COLORS[axis] }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-foreground/70">{AXIS_INFO[axis].name}</span>
                  <span className="ml-auto font-bold tabular-nums">
                    {Number.isFinite(value) ? Number(value).toFixed(1) : "–"}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-xs text-foreground/50">
            Tap a point on the chart to see that assessment.
          </p>
        </div>
      )}
    </div>
  );
}
