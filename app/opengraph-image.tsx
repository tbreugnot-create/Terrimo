import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = "Terrimo — Immobilier Bassin d'Arcachon";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          background: '#0f1923',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cercles décoratifs — évocation carte/mer */}
        <div style={{
          position: 'absolute',
          right: -120,
          top: -120,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(93,255,211,0.08) 0%, transparent 70%)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          right: 80,
          top: 80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          border: '1px solid rgba(93,255,211,0.12)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          right: 130,
          top: 130,
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '1px solid rgba(93,255,211,0.1)',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          left: -60,
          bottom: -60,
          width: 350,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(93,255,211,0.05) 0%, transparent 70%)',
          display: 'flex',
        }} />

        {/* Contenu principal */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 100px',
          height: '100%',
          gap: 0,
        }}>
          {/* Badge */}
          <div style={{
            display: 'flex',
            marginBottom: 32,
          }}>
            <div style={{
              background: 'rgba(93,255,211,0.1)',
              border: '1px solid rgba(93,255,211,0.25)',
              borderRadius: 8,
              padding: '6px 16px',
              color: '#5dffd3',
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '0.08em',
            }}>
              BASSIN D'ARCACHON
            </div>
          </div>

          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
            marginBottom: 24,
          }}>
            <span style={{
              fontSize: 96,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-4px',
              lineHeight: 1,
            }}>Terrimo</span>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#5dffd3',
              marginBottom: 8,
              display: 'flex',
            }} />
          </div>

          {/* Tagline */}
          <div style={{
            fontSize: 32,
            color: '#78909c',
            fontWeight: 400,
            lineHeight: 1.4,
            maxWidth: 680,
          }}>
            La carte immobilière du Bassin d'Arcachon
          </div>

          {/* Features */}
          <div style={{
            display: 'flex',
            gap: 32,
            marginTop: 48,
          }}>
            {['Estimation DVF', 'Agences & Conciergeries', 'Prix au m²'].map((f) => (
              <div key={f} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#b0bec5',
                fontSize: 20,
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#5dffd3',
                  display: 'flex',
                }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* URL en bas à droite */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          right: 100,
          color: '#37474f',
          fontSize: 20,
          letterSpacing: '0.05em',
          display: 'flex',
        }}>
          terrimo.homes
        </div>
      </div>
    ),
    { ...size }
  );
}
