import { AXIS_INFO, type AxisScores } from '@/lib/quiz/scoring'

// The six Continua axes as a circle: each axis is a diameter whose two ends sit
// where the logo's arms do, shaded from one end's color to the other's. No
// profile or scores, just the map. Each end is named with one word, from the
// book's own pairings (Ch. 8: Empathy and Detachment, Altruism and Self-Focus,
// Agency and Accommodation, Reactivity and Calm). On phones the ring labels would be too small, so the
// same six gradients are listed as a legend instead.

type Axis = keyof AxisScores

// Clock position of each axis's high-score end (its low end is opposite),
// and the logo colors of both ends.
const AXES: { axis: Axis; highAt: number; low: string; high: string }[] = [
  { axis: 'social_attunement', highAt: 12, low: '#41377b', high: '#fcf050' },
  { axis: 'empathy', highAt: 1, low: '#68397c', high: '#abc854' },
  { axis: 'self_orientation', highAt: 8, low: '#4ba454', high: '#933160' },
  { axis: 'conscientiousness', highAt: 3, low: '#da1070', high: '#49a297' },
  { axis: 'agency', highAt: 10, low: '#4ba6d2', high: '#c13732' },
  { axis: 'reactivity', highAt: 11, low: '#2b65a0', high: '#d16539' },
]

const CX = 600
const CY = 520
const R = 330
const LABEL_R = R + 36

const axisName = (axis: Axis) => (axis === 'empathy' ? 'Empathy' : AXIS_INFO[axis].name)

// One word per end.
const END: Record<Axis, { low: string; high: string }> = {
  social_attunement: { low: 'Hypo-Attunement', high: 'Hyper-Attunement' },
  empathy: { low: 'Detachment', high: 'Empathy' },
  self_orientation: { low: 'Altruism', high: 'Self-Focus' },
  conscientiousness: { low: 'Spontaneity', high: 'Conscientiousness' },
  agency: { low: 'Accommodation', high: 'Agency' },
  reactivity: { low: 'Calm', high: 'Reactivity' },
}

// Light logo colors (the yellow especially) are unreadable as text on a light
// card, so label text uses a darkened shade of the same hue.
function textShade(hex: string, amount = 0.38) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (shift: number) => Math.round(((n >> shift) & 255) * (1 - amount))
  return `rgb(${ch(16)}, ${ch(8)}, ${ch(0)})`
}

function point(clock: number, radius: number) {
  const angle = ((clock % 12) * 30 - 90) * (Math.PI / 180)
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) }
}

function EndLabel({ clock, text, color, size }: { clock: number; text: string; color: string; size: number }) {
  const { x, y } = point(clock, LABEL_R)
  const dx = x - CX
  const anchor = dx > 40 ? 'start' : dx < -40 ? 'end' : 'middle'
  const top = clock === 12 || clock === 11 || clock === 1
  const bottom = clock >= 5 && clock <= 7
  const dy = top ? -6 : bottom ? size + 2 : size * 0.35
  return (
    <text x={x} y={y} dy={dy} textAnchor={anchor} fill={textShade(color)} fontWeight={600} fontSize={size}>
      {text}
    </text>
  )
}

const DESCRIPTION = `The six Continua axes: ${AXES.map(
  ({ axis }) => `${axisName(axis)}, from ${END[axis].low} to ${END[axis].high}`
).join('; ')}`

// Same drawing at two scales: phones get larger words and a wider frame (the
// long right-hand words need the room), larger screens a balanced frame.
export default function AxesCircle() {
  return (
    <div>
      <Diagram id="wide" viewBox="-90 50 1380 950" size={34} className="hidden sm:block w-full" />
      <Diagram id="narrow" viewBox="-130 20 1650 1010" size={58} className="sm:hidden w-full" />
    </div>
  )
}

// Each copy needs its own gradient ids: a url(#id) resolves to the first match
// in the page, which would be inside the copy hidden at this screen size.
function Diagram({ id, viewBox, size, className }: { id: string; viewBox: string; size: number; className: string }) {
  return (
      <svg
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        role="img"
        aria-label={DESCRIPTION}
        style={{ fontFamily: 'inherit' }}
      >
        <defs>
          {AXES.map(({ axis, highAt, low, high }) => {
            const a = point(highAt + 6, R)
            const b = point(highAt, R)
            return (
              <linearGradient key={axis} id={`${id}-axis-${axis}`} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
                <stop offset="0" stopColor={low} />
                <stop offset="1" stopColor={high} />
              </linearGradient>
            )
          })}
        </defs>

        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#000" strokeOpacity={0.08} strokeWidth={2} />

        {AXES.map(({ axis, highAt }) => {
          const a = point(highAt + 6, R)
          const b = point(highAt, R)
          return (
            <line key={axis} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={`url(#${id}-axis-${axis})`} strokeWidth={14} strokeLinecap="round" />
          )
        })}

        {/* Center hub echoing the logo's dashed ring */}
        <circle cx={CX} cy={CY} r={58} fill="white" />
        {AXES.flatMap(({ axis, highAt, low, high }) =>
          [
            { clock: highAt, color: high },
            { clock: highAt + 6, color: low },
          ].map(({ clock, color }) => {
            const s = point(clock - 0.32, 46)
            const e = point(clock + 0.32, 46)
            return (
              <path key={`${axis}-${clock}`} d={`M ${s.x} ${s.y} A 46 46 0 0 1 ${e.x} ${e.y}`} stroke={color} strokeWidth={9} fill="none" strokeLinecap="round" />
            )
          })
        )}

        <g>
          {AXES.flatMap(({ axis, highAt, low, high }) => [
            <EndLabel key={`${axis}-h`} clock={highAt} text={END[axis].high} color={high} size={size} />,
            <EndLabel key={`${axis}-l`} clock={(highAt + 6) % 12 || 12} text={END[axis].low} color={low} size={size} />,
          ])}
        </g>
      </svg>
  )
}
