import { useRider } from '../lib/RiderContext.jsx'
import { useRoster } from '../lib/useRoster.js'
import { useCheckins } from '../lib/useCheckins.js'

const WINDOW = 30 * 60 * 1000 // "present" if checked in within 30 min

function ago(ts) {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); return `${h}h ago`
}

export default function RollCall() {
  const { uid, name, remote } = useRider()
  const roster = useRoster(remote)
  const { checkins, checkIn } = useCheckins(remote)

  if (!remote) return null

  const byId = {}
  checkins.forEach(c => { byId[c.rider_id] = c.ts })
  const present = roster.filter(r => byId[r.id] && Date.now() - byId[r.id] < WINDOW)
  const iAmIn = byId[uid] && Date.now() - byId[uid] < WINDOW

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 14 }}>🧑‍🤝‍🧑 Roll call · {present.length}/{roster.length || '—'} here</h2>
        <button onClick={() => checkIn(uid, name)} style={{
          fontSize: 13, fontWeight: 700, borderRadius: 20, padding: '6px 14px',
          background: iAmIn ? 'var(--surface)' : 'var(--green)',
          color: iAmIn ? 'var(--text)' : '#0a0a0a',
          border: iAmIn ? '1px solid var(--border)' : 'none',
        }}>{iAmIn ? '✓ Checked in' : "I'm here"}</button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
        Tap at each regroup so the group knows everyone made it (resets after 30 min).
      </div>
      {roster.map(r => {
        const ts = byId[r.id]
        const here = ts && Date.now() - ts < WINDOW
        return (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', fontSize: 13, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 16 }}>{here ? '✅' : '⬜'}</span>
            <span style={{ flex: 1, color: here ? 'var(--text)' : 'var(--text-muted)' }}>{r.name}{r.id === uid ? ' (you)' : ''}</span>
            {ts && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ago(ts)}</span>}
          </div>
        )
      })}
    </div>
  )
}
