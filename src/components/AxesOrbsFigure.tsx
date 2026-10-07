import Image from 'next/image'

// Positions are percentages of the artwork, measured from the source slide.
// Side labels are anchored to the edge nearest their orb so they never overlap it.
type Label = {
  text: React.ReactNode
  color: string
  y: number
  x: number
  anchor: 'center' | 'left' | 'right'
}

const labels: Label[] = [
  { text: 'Social Attunement', color: '#1769D2', x: 50.3, y: 4.5, anchor: 'center' },
  { text: 'Empathy', color: '#07563C', x: 78.5, y: 25.8, anchor: 'left' },
  { text: <>Self-<br />Orientation</>, color: '#14526A', x: 78.5, y: 63, anchor: 'left' },
  { text: 'Conscientiousness', color: '#5530B5', x: 50.3, y: 92, anchor: 'center' },
  { text: 'Agency', color: '#A80E57', x: 16.5, y: 63, anchor: 'right' },
  { text: 'Reactivity', color: '#EC3822', x: 16.5, y: 25.8, anchor: 'right' },
]

const translate = {
  center: 'translate(-50%, -50%)',
  left: 'translate(0, -50%)',
  right: 'translate(-100%, -50%)',
}

export default function AxesOrbsFigure() {
  return (
    <div className="px-[3%] py-[4%]">
      <div className="relative w-full" style={{ containerType: 'inline-size' }}>
        <Image
          src="/continua-axes-orbs.webp"
          alt="The six Continua axes arranged around a central orb: Social Attunement, Empathy, Self-Orientation, Conscientiousness, Agency, and Reactivity."
          width={1600}
          height={1234}
          sizes="(min-width: 1024px) 912px, (min-width: 768px) 672px, 100vw"
          className="w-full h-auto"
          priority
        />
        {labels.map((l, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="absolute whitespace-nowrap font-semibold leading-[1.15]"
            style={{
              left: `${l.x}%`,
              top: `${l.y}%`,
              transform: translate[l.anchor],
              textAlign: l.anchor === 'center' ? 'center' : l.anchor,
              color: l.color,
              fontFamily: 'var(--font-lora), Georgia, serif',
              fontSize: '3.1cqw',
            }}
          >
            {l.text}
          </span>
        ))}
      </div>
    </div>
  )
}
