import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Continua — The Personality Continua'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, rgba(67, 117, 237, 0.92) 0%, rgba(169, 137, 236, 0.92) 35%, rgb(229, 158, 221) 100%)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.77)',
            borderRadius: '24px',
            padding: '60px 80px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: 'rgb(7, 7, 8)',
              letterSpacing: '-0.02em',
              marginBottom: '16px',
            }}
          >
            Continua
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgb(7, 7, 8)',
              opacity: 0.7,
              letterSpacing: '-0.01em',
            }}
          >
            The Personality Continua
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
