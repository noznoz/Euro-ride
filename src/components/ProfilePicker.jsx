import { useState } from 'react'
import { trip } from '../data/trip.js'
import { useProfile } from '../lib/ProfileContext.jsx'
import chapterLogo from '../assets/chapter-logo.png'

export default function ProfilePicker() {
  const { setProfile } = useProfile()
  const [custom, setCustom] = useState('')

  const start = (name) => {
    const clean = name.trim()
    if (clean) setProfile(clean)
  }

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24,
      textAlign: 'center',
    }}>
      <img src={chapterLogo} alt="H.O.G. Jeddah Chapter" style={{ width: 220, maxWidth: '80%' }} />
      <div>
        <h1 style={{ fontSize: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Who's riding?</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
          Pick your name — your expenses, reservations, packing list and ride
          progress are saved under it on this phone.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {trip.riders.map(r => (
          <button key={r.name} onClick={() => start(r.name)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '10px 16px', fontSize: 15, fontWeight: 600,
          }}>
            <span style={{ fontSize: 18 }}>{r.emoji}</span> {r.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 320 }}>
        <input
          className="field"
          placeholder="Or type your name…"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && start(custom)}
        />
        <button onClick={() => start(custom)} style={{
          background: 'var(--accent)', color: '#0a0a0a', fontWeight: 700,
          borderRadius: 10, padding: '0 18px', fontSize: 14, flexShrink: 0,
        }}>Start</button>
      </div>
    </div>
  )
}
