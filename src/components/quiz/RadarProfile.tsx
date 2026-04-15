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

// 12 poles clockwise from 12 o'clock; colors match the personality map.
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

const OUTER_R = 132;
const RING_W = 10;
const INNER_R = OUTER_R - RING_W;
const LABEL_R = OUTER_R + 12;
const VIEW_W = 560;
const VIEW_H = 380;

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

// Pie slice from origin to angle range at given outer radius.
function pieSlice(angleCenter: number, outerR: number) {
  const a1 = angleCenter - 15;
  const a2 = angleCenter + 15;
  const p1 = polar(a1, outerR);
  const p2 = polar(a2, outerR);
  return `M 0 0 L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${outerR.toFixed(
    2,
  )} ${outerR.toFixed(2)} 0 0 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`;
}

// Annular sector (donut slice) from innerR to outerR.
function annularSlice(angleCenter: number, innerR: number, outerR: number) {
  const a1 = angleCenter - 15;
  const a2 = angleCenter + 15;
  const o1 = polar(a1, outerR);
  const o2 = polar(a2, outerR);
  const i1 = polar(a1, innerR);
  const i2 = polar(a2, innerR);
  return `M ${i1.x.toFixed(2)} ${i1.y.toFixed(2)} L ${o1.x.toFixed(
    2,
  )} ${o1.y.toFixed(2)} A ${outerR.toFixed(2)} ${outerR.toFixed(
    2,
  )} 0 0 1 ${o2.x.toFixed(2)} ${o2.y.toFixed(2)} L ${i2.x.toFixed(
    2,
  )} ${i2.y.toFixed(2)} A ${innerR.toFixed(2)} ${innerR.toFixed(
    2,
  )} 0 0 0 ${i1.x.toFixed(2)} ${i1.y.toFixed(2)} Z`;
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
      style={{ overflow: "visible" }}
      role="img"
      aria-label="Six-axis personality profile map"
    >
      <defs>
        <filter id="radar-soften" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>
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
            <stop offset="0%" stopColor={p.color} stopOpacity="0.65" />
            <stop offset="70%" stopColor={p.color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={p.color} stopOpacity="1" />
          </radialGradient>
        ))}
      </defs>

      {[0.25, 0.5, 0.75].map((f) => (
        <polygon
          key={`grid-${f}`}
          points={hexPoints(INNER_R * f)}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={1}
        />
      ))}

      <g filter="url(#radar-soften)">
        {POLES.map((p, i) => {
          const intensity = poleIntensities[i];
          if (intensity < 0.1) return null;
          const angle = i * 30;
          const depth = (intensity / 10) * INNER_R;
          const d =
            intensity >= 9.9
              ? pieSlice(angle, INNER_R)
              : annularSlice(angle, INNER_R - depth, INNER_R);
          return (
            <path
              key={`wedge-${i}`}
              d={d}
              fill={`url(#wedge-grad-${i})`}
            />
          );
        })}
      </g>

      {POLES.map((p, i) => {
        const angle = i * 30;
        return (
          <path
            key={`ring-${i}`}
            d={annularSlice(angle, INNER_R, OUTER_R)}
            fill={p.color}
            stroke="white"
            strokeWidth={0.8}
          />
        );
      })}

      <polygon
        points={hexPoints(INNER_R)}
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth={1}
      />
      <polygon
        points={hexPoints(OUTER_R)}
        fill="none"
        stroke="rgba(0,0,0,0.28)"
        strokeWidth={1.2}
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
              stroke="rgba(0,0,0,0.35)"
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
