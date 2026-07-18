import { useState } from 'react'
import { useRider } from '../lib/RiderContext.jsx'
import { useRoster } from '../lib/useRoster.js'
import { useLocations } from '../lib/useLocations.js'
import { notifyRiders } from '../lib/push.js'

function ago(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function CrewLocation() {
  const { uid, name, remote } = useRider()
  const roster = useRoster(remote)
  const { locations, share, sharing } = useLocations(remote)
  const [msg, setMsg] = useState(null)

  if (!remote) return null

  const doShare = async (sos) => {
    setMsg(null)
    try {
      await share(uid, name, sos)
      if (sos) {
        const others = roster.filter(r => r.id !== uid).map(r => r.id)
        notifyRiders(others, { title: '🆘 SOS', body: `${name} needs help — tap to see location`, url: '/' })
        setMsg('🆘 SOS sent to the crew with your location.')
      } else {
        setMsg('📍 Location shared with the crew.')
      }
    } catch (e) {
      setMsg(e?.code === 1 ? 'Location permission denied — enable it in your browser.' : 'Couldn\'t get your location.')
    }
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: 14, marginBottom: 8 }}>📍 Crew location</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button onClick={() => doShare(false)} disabled={sharing} style={{
          flex: 2, padding: 10, borderRadius: 10, background: 'var(--accent)',
          color: '#0a0a0a', fontWeight: 700, fontSize: 14, opacity: sharing ? 0.6 : 1,
        }}>{sharing ? 'Locating…' : '📍 Share my location'}</button>
        <button onClick={() => doShare(true)} disabled={sharing} style={{
          flex: 1, padding: 10, borderRadius: 10, background: '#c62828',
          color: '#fff', fontWeight: 800, fontSize: 14,
        }}>🆘 SOS</button>
      </div>
      {msg && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{msg}</div>}

      {locations.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          No one has shared their location yet. Tap “Share my location” so the crew can find each other.
        </div>
      )}
      {locations.map(l => (
        <a key={l.rider_id}
          href={`https://www.google.com/maps?q=${l.lat},${l.lon}`}
          target="_blank" rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
            borderTop: '1px solid var(--border)', fontSize: 13,
          }}>
          <span style={{ fontSize: 18 }}>{l.sos ? '🆘' : '📍'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: l.sos ? '#ff6b6b' : 'var(--text)' }}>
              {l.rider_name || 'Rider'}{l.rider_id === uid ? ' (you)' : ''}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Updated {ago(l.ts || Date.parse(l.updated_at))}</div>
          </div>
          <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>Map ›</span>
        </a>
      ))}
    </div>
  )
}
