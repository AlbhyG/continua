"use client";

interface AxisResult {
  axis: string;
  name: string;
  score: number;
  label: string;
  highLabel: string;
  lowLabel: string;
}

type PoleAxis =
  | "empathy"
  | "self_orientation"
  | "social_attunement"
  | "conscientiousness"
  | "agency"
  | "reactivity";

interface Pole {
  short: string;
  color: string;
  axis: PoleAxis;
  isHigh: boolean;
}

// 12 poles in clockwise order starting at 12 o'clock.
// Colors follow Albhy's personality-map system (see AxesDiagram + orb-mapping).
const POLES: Pole[] = [
  { short: "High Empathy",    color: "#fcf050", axis: "empathy",           isHigh: true  },
  { short: "Altruistic",      color: "#abc854", axis: "self_orientation",  isHigh: false },
  { short: "Hyper-Attuned",   color: "#4ba454", axis: "social_attunement", isHigh: true  },
  { short: "Conscientious",   color: "#49a297", axis: "conscientiousness", isHigh: true  },
  { short: "Yielding",        color: "#4ba6d2", axis: "agency",            isHigh: false },
  { short: "Low Reactivity",  color: "#2b65a0", axis: "reactivity",        isHigh: false },
  { short: "Detached",        color: "#41377b", axis: "empathy",           isHigh: false },
  { short: "Self-Focused",    color: "#68397c", axis: "self_orientation",  isHigh: true  },
  { short: "Hypo-Attuned",    color: "#933160", axis: "social_attunement", isHigh: false },
  { short: "Spontaneous",     color: "#da1070", axis: "conscientiousness", isHigh: false },
  { short: "Agentic",         color: "#c13732", axis: "agency",            isHigh: true  },
  { short: "Highly Reactive", color: "#d16539", axis: "reactivity",        isHigh: true  },
];

const MAX_R = 130;
const GRID_RINGS = [2, 4, 6, 8, 10];
const VIEW_W = 520;
const VIEW_H = 360;

function polar(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: radius * Math.cos(rad), y: radius * Math.sin(rad) };
}

function hexPoints(radius: number) {
  return [0, 60, 120, 180, 240, 300]
    .map((a) => {
      const p = polar(a, radius);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    })
    .join(" ");
}

function wedgePath(angleCenter: number, radius: number) {
  const p1 = polar(angleCenter - 15, radius);
  const p2 = polar(angleCenter + 15, radius);
  return `M 0 0 L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${radius.toFixed(
    2,
  )} ${radius.toFixed(2)} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
}

export default function RadarProfile({ data }: { data: AxisResult[] }) {
  const byAxis = new Map<string, number>(data.map((ar) => [ar.axis, ar.score]));

  const poleIntensities = POLES.map((p) => {
    const score = byAxis.get(p.axis) ?? 5.5;
    const v = p.isHigh ? score : 11 - score;
    return Math.max(0, Math.min(10, v));
  });

  return (
    <svg
      viewBox={`${-VIEW_W / 2} ${-VIEW_H / 2} ${VIEW_W} ${VIEW_H}`}
      className="w-full h-auto block"
      style={{ maxHeight: 360, overflow: "visible" }}
      role="img"
      aria-label="Six-axis personality profile map"
    >
      {GRID_RINGS.map((v) => (
        <polygon
          key={v}
          points={hexPoints((v / 10) * MAX_R)}
          fill="none"
          stroke="rgba(0,0,0,0.07)"
          strokeWidth={1}
        />
      ))}

      {POLES.map((_, i) => {
        const end = polar(i * 30, MAX_R);
        return (
          <line
            key={`ray-${i}`}
            x1={0}
            y1={0}
            x2={end.x}
            y2={end.y}
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={1}
          />
        );
      })}

      {POLES.map((p, i) => {
        const intensity = poleIntensities[i];
        const radius = (intensity / 10) * MAX_R;
        if (radius < 1) return null;
        return (
          <path
            key={`wedge-${i}`}
            d={wedgePath(i * 30, radius)}
            fill={p.color}
            fillOpacity={0.88}
            stroke={p.color}
            strokeWidth={0.5}
          />
        );
      })}

      <polygon
        points={hexPoints(MAX_R)}
        fill="none"
        stroke="rgba(0,0,0,0.22)"
        strokeWidth={1.5}
      />

      {POLES.map((_, i) => {
        const intensity = poleIntensities[i];
        if (intensity < 1.2) return null;
        const labelR = Math.max(16, (intensity / 10) * MAX_R * 0.72);
        const p = polar(i * 30, labelR);
        return (
          <text
            key={`val-${i}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={12}
            fontWeight={700}
            fill="white"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={0.6}
            paintOrder="stroke fill"
          >
            {Math.round(intensity)}
          </text>
        );
      })}

      {POLES.map((pole, i) => {
        const angle = i * 30;
        const p = polar(angle, MAX_R + 14);
        let anchor: "start" | "middle" | "end" = "middle";
        let baseline: "auto" | "middle" | "hanging" = "middle";
        if (angle === 0) {
          anchor = "middle";
          baseline = "auto";
        } else if (angle === 180) {
          anchor = "middle";
          baseline = "hanging";
        } else if (angle < 180) {
          anchor = "start";
        } else {
          anchor = "end";
        }
        return (
          <text
            key={`lbl-${i}`}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline={baseline}
            fontSize={11}
            fontWeight={600}
            fill="rgba(0,0,0,0.7)"
          >
            {pole.short}
          </text>
        );
      })}
    </svg>
  );
}
