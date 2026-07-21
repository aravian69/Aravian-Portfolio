import { ImageResponse } from 'next/og';

// Branded 1200x630 card shown when the site is shared (WhatsApp, X, LinkedIn,
// Upwork, iMessage…). Generated at build time — no static asset to maintain.
export const alt = 'Abdul Aziz — VFX, Motion & AI video creator, Jakarta';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BG = '#0a0a0f';
const TEXT = '#f4f4f6';
const MUTED = '#9a9aa2';
const ACCENT = '#b4ff00';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: `radial-gradient(1100px 700px at 82% 8%, rgba(180,255,0,0.14), rgba(10,10,15,0) 60%), ${BG}`,
          fontFamily: 'sans-serif',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: 26,
            letterSpacing: 6,
            color: ACCENT,
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: 46, height: 3, background: ACCENT }} />
          <div style={{ display: 'flex' }}>VFX · Motion · AI · Color · Jakarta</div>
        </div>

        {/* Name + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 138, fontWeight: 800, color: TEXT, letterSpacing: -4, lineHeight: 1 }}>
            Abdul Aziz
          </div>
          <div style={{ display: 'flex', fontSize: 46, fontWeight: 600, letterSpacing: -1 }}>
            <div style={{ display: 'flex', color: MUTED }}>I make the ordinary,&nbsp;</div>
            <div style={{ display: 'flex', color: ACCENT }}>cinematic.</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 28 }}>
          <div style={{ display: 'flex', color: ACCENT, fontWeight: 600 }}>rav709.site</div>
          <div style={{ display: 'flex', color: MUTED, letterSpacing: 2 }}>Portfolio</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
