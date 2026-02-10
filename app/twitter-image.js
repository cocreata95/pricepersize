import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'PricePerSize - Unit Price Calculator'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2563eb',
          padding: '40px 60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '16px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#2563eb',
              marginRight: '20px',
            }}
          >
            $/
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            PricePerSize
          </div>
        </div>
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          Compare prices per unit instantly
        </div>
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
          }}
        >
          Free • Fast • No signup required
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          pricepersize.site
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
