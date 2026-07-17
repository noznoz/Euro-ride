import { useState } from 'react'
import { useCollection } from '../lib/useCollection.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { useRider } from '../lib/RiderContext.jsx'

function fmt(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

// Shared daily journal for one itinerary day — every rider can add an entry;
// together they become the trip's travel story.
export default function DayJournal({ day }) {
  const { name, uid, remote } = useRider()
  const shared = useCollection('journal', { enabled: remote })
  const [local, setLocal] = useLocalStorage(`euroride.${name}.journal.${day}`, [])
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)

  const entries = (remote ? shared.items.filter(e => e.day === day) : local)
    .slice().sort((a, b) => (a.ts || a.id) - (b.ts || b.id))
  const isMine = (e) => remote ? e.created_by === uid : true

  const add = () => {
    const t = text.trim()
    if (!t) return
    const item = { id: Date.now(), day, text: t, by: name, ts: Date.now() }
    if (remote) shared.upsert(item)
    else setLocal(l => [...l, item])
    setText(''); setAdding(false)
  }
  const remove = (id) => {
    if (remote) shared.remove(id)
    else setLocal(l => l.filter(e => e.id !== id))
  }

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>📓 Journal</div>

      {entries.map(e => (
        <div key={e.id} style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: 10, marginBottom: 6,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{e.by || 'rider'}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fmt(e.ts || e.id)}</span>
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap', marginTop: 4 }}>{e.text}</div>
          {isMine(e) && (
            <button onClick={() => remove(e.id)} style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Delete</button>
          )}
        </div>
      ))}

      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <textarea autoFocus className="field" rows={3} style={{ resize: 'vertical' }}
            placeholder="How was today? Roads, views, moments to remember…"
            value={text} onChange={e => setText(e.target.value)} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{ flex: 1, padding: 8, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)', fontSize: 13 }}>Cancel</button>
            <button onClick={add} style={{ flex: 2, padding: 8, borderRadius: 8, background: 'var(--accent)', color: '#0a0a0a', fontWeight: 700, fontSize: 13 }}>Save entry</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
          + Add journal entry
        </button>
      )}
    </div>
  )
}
