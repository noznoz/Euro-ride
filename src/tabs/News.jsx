import { useState } from 'react'
import { useCollection } from '../lib/useCollection.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { useRider } from '../lib/RiderContext.jsx'

function ago(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function News() {
  const { name, uid, remote } = useRider()
  const shared = useCollection('announcements', { enabled: remote, orderBy: 'id', ascending: false })
  const [localItems, setLocalItems] = useLocalStorage(`euroride.${name}.news.v1`, [])
  const [text, setText] = useState('')

  const items = remote ? shared.items : localItems
  const isMine = (it) => remote ? it.created_by === uid : true

  const post = () => {
    const t = text.trim()
    if (!t) return
    const item = { id: Date.now(), text: t, by: name, ts: Date.now() }
    if (remote) shared.upsert(item)
    else setLocalItems(l => [item, ...l])
    setText('')
  }
  const remove = (id) => {
    if (remote) shared.remove(id)
    else setLocalItems(l => l.filter(i => i.id !== id))
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 20 }}>📣 News</h1>

      {/* Compose */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <textarea
          className="field" rows={2} style={{ resize: 'vertical' }}
          placeholder="Post an update for the crew… (departure time, fuel stop, regroup point)"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button onClick={post} disabled={!text.trim()} style={{
          alignSelf: 'flex-end', background: 'var(--accent)', color: '#0a0a0a',
          fontWeight: 700, fontSize: 14, borderRadius: 10, padding: '8px 18px',
          opacity: text.trim() ? 1 : 0.5,
        }}>Post</button>
      </div>

      {/* Feed */}
      {items.map(it => (
        <div key={it.id} className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{it.by || 'rider'}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ago(it.ts || it.id)}</span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{it.text}</div>
          {isMine(it) && (
            <button onClick={() => remove(it.id)} style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              Delete
            </button>
          )}
        </div>
      ))}

      {items.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 20 }}>
          No announcements yet. Post the first update above 📣
        </div>
      )}
    </div>
  )
}
