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

const MAX_R = 132;
const LABEL_R = MAX_R + 14;
const VIEW_W = 560;
const VIEW_H = 380;
const GRID_RINGS = [2, 4, 6, 8];
const MIN_R = 3;

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

type Pt = { x: number; y: number };

function mid(a: Pt, b: Pt): Pt {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function fmt(p: Pt) {
  return `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
}

export default function RadarProfile({ data }: { data: AxisResult[] }) {
  const byAxis = new Map<string, number>(data.map((ar) => [ar.axis, ar.score]));

  const poleIntensities = POLES.map((p) => {
    const score = byAxis.get(p.axis) ?? 5.5;
    const v = p.isHigh ? score : 11 - score;
    return Math.max(0, Math.min(10, v));
  });

  // Vertex for each pole at its scored radius (clamped to a tiny minimum so
  // wedges stay connected at the center when a pole is near 0).
  const vertices: Pt[] = POLES.map((_, i) => {
    const r = Math.max(MIN_R, (poleIntensities[i] / 10) * MAX_R);
    return polar(i * 30, r);
  });

  const perimeter = vertices.map((v) => `${v.x.toFixed(2)},${v.y.toFixed(2)}`).join(" ");

  return (
    <svg
      viewBox={`${-VIEW_W / 2} ${-VIEW_H / 2} ${VIEW_W} ${VIEW_H}`}
      className="w-full h-auto block"
      style={{ overflow: "visible" }}
      role="img"
      aria-label="Six-axis personality profile map"
    >
      <defs>
        {POLES.map((p, i) => (
          <radialGradient
            key={`grad-${i}`}
            id={`wedge-grad-${i}`}
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor={p.color} stopOpacity="1" />
            <stop offset="60%" stopColor={p.color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={p.color} stopOpacity="0.75" />
          </radialGradient>
        ))}
      </defs>

      {GRID_RINGS.map((v) => (
        <polygon
          key={`grid-${v}`}
          points={hexPoints((v / 10) * MAX_R)}
          fill="none"
          stroke="rgba(0,0,0,0.07)"
          strokeWidth={1}
        />
      ))}

      {/* Each pole's wedge is a kite: origin → mid(prev,cur) → cur → mid(cur,next) → origin.
          Adjacent wedges share the origin-to-midpoint edge, so they tile the whole
          polygon with no gaps and the perimeter is continuous. */}
      {POLES.map((p, i) => {
        const v = vertices[i];
        const vPrev = vertices[(i + 11) % 12];
        const vNext = vertices[(i + 1) % 12];
        const mPrev = mid(vPrev, v);
        const mNext = mid(v, vNext);
        const d = `M 0 0 L ${fmt(mPrev)} L ${fmt(v)} L ${fmt(mNext)} Z`;
        return (
          <path
            key={`wedge-${i}`}
            d={d}
            fill={`url(#wedge-grad-${i})`}
          />
        );
      })}

      {/* Connected perimeter around the data polygon */}
      <polygon
        points={perimeter}
        fill="none"
        stroke="rgba(0,0,0,0.35)"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />

      {/* Outer hex frame (full-scale reference at score 10) */}
      <polygon
        points={hexPoints(MAX_R)}
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth={1}
        strokeDasharray="2 3"
      />

      {POLES.map((pole, i) => {
        const intensity = poleIntensities[i];
        const angle = i * 30;
        const p = polar(angle, LABEL_R);
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
        const nameDy = angle === 0 ? -11 : angle === 180 ? 0 : -6;
        const valDy = angle === 0 ? 0 : angle === 180 ? 13 : 8;
        return (
          <g key={`lbl-${i}`}>
            <text
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline={baseline}
              fontSize={10.5}
              fontWeight={600}
              fill="rgba(0,0,0,0.75)"
              dy={nameDy}
            >
              {pole.short}
            </text>
            <text
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline={baseline}
              fontSize={11}
              fontWeight={700}
              fill={pole.color}
              stroke="rgba(0,0,0,0.4)"
              strokeWidth={0.3}
              paintOrder="stroke fill"
              dy={valDy}
            >
              {Math.round(intensity)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
