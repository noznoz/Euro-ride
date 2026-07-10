import chapterLogo from '../assets/chapter-logo.png'

// Shared centered card shell for the auth/pending screens.
export default function Shell({ children }) {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8,
      background: 'var(--bg)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <img src={chapterLogo} alt="H.O.G. Jeddah Chapter" style={{ width: 180, maxWidth: '65%' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 2, textTransform: 'uppercase' }}>
          Europe Ride 2026
        </span>
      </div>
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 22,
      }}>
        {children}
      </div>
    </div>
  )
}

export const field = {
  width: '100%', background: '#111', border: '1px solid var(--border)',
  borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
  fontSize: 14, outline: 'none', marginBottom: 12,
}

export const primaryBtn = {
  width: '100%', background: 'var(--accent)', color: '#0a0a0a',
  fontWeight: 700, fontSize: 15, padding: 13, borderRadius: 10,
}
