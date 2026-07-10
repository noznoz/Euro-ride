import { useState } from 'react'
import { packingTemplate } from '../data/trip.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { useRider } from '../lib/RiderContext.jsx'

// Stored shape: { groups: [{ group, items: [{ text, done }] }] }
function fromTemplate() {
  return {
    groups: packingTemplate.map(g => ({
      group: g.group,
      items: g.items.map(text => ({ text, done: false })),
    })),
  }
}

export default function Packing() {
  const { name } = useRider()
  const [state, setState] = useLocalStorage(`euroride.${name}.packing.v1`, fromTemplate())
  const [adding, setAdding] = useState(null) // group name currently adding to
  const [draft, setDraft] = useState('')

  const all = state.groups.flatMap(g => g.items)
  const done = all.filter(i => i.done).length
  const pct = all.length ? Math.round((done / all.length) * 100) : 0

  const toggle = (gi, ii) => setState(s => {
    const groups = s.groups.map((g, a) => a !== gi ? g : {
      ...g, items: g.items.map((it, b) => b !== ii ? it : { ...it, done: !it.done }),
    })
    return { groups }
  })

  const remove = (gi, ii) => setState(s => ({
    groups: s.groups.map((g, a) => a !== gi ? g : {
      ...g, items: g.items.filter((_, b) => b !== ii),
    }),
  }))

  const add = (gi) => {
    const text = draft.trim()
    if (!text) return
    setState(s => ({
      groups: s.groups.map((g, a) => a !== gi ? g : {
        ...g, items: [...g.items, { text, done: false }],
      }),
    }))
    setDraft('')
    setAdding(null)
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h1 style={{ fontSize: 20 }}>🎒 Packing — {name}</h1>
        <button
          onClick={() => { if (confirm('Reset the list to the template? Your ticks and custom items will be lost.')) setState(fromTemplate()) }}
          style={{ fontSize: 12, color: 'var(--text-muted)' }}
        >Reset</button>
      </div>

      {/* Progress */}
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span>{done} / {all.length} packed</span>
          <span style={{ color: pct === 100 ? 'var(--green)' : 'var(--accent)', fontWeight: 700 }}>
            {pct === 100 ? 'Ready to ride! 🏍️' : `${pct}%`}
          </span>
        </div>
        <div style={{ height: 6, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: pct === 100 ? 'var(--green)' : 'var(--accent)',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {state.groups.map((g, gi) => (
        <div key={g.group} className="card">
          <h2 style={{ fontSize: 14, marginBottom: 8 }}>{g.group}</h2>
          {g.items.map((it, ii) => (
            <div key={ii} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
              <button onClick={() => toggle(gi, ii)} style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: `2px solid ${it.done ? 'var(--green)' : 'var(--border)'}`,
                background: it.done ? 'var(--green)' : 'transparent',
                color: '#0a0a0a', fontSize: 13, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{it.done ? '✓' : ''}</button>
              <span
                onClick={() => toggle(gi, ii)}
                style={{
                  flex: 1, fontSize: 14, cursor: 'pointer',
                  color: it.done ? 'var(--text-muted)' : 'var(--text)',
                  textDecoration: it.done ? 'line-through' : 'none',
                }}
              >{it.text}</span>
              <button onClick={() => remove(gi, ii)} style={{ color: 'var(--text-muted)', fontSize: 14, padding: '0 4px' }}>✕</button>
            </div>
          ))}

          {adding === g.group ? (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                autoFocus
                className="field"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && add(gi)}
                placeholder="New item…"
              />
              <button onClick={() => add(gi)} style={{
                background: 'var(--accent)', color: '#0a0a0a', fontWeight: 700,
                borderRadius: 10, padding: '0 16px', fontSize: 14,
              }}>Add</button>
            </div>
          ) : (
            <button
              onClick={() => { setAdding(g.group); setDraft('') }}
              style={{ color: 'var(--accent)', fontSize: 13, marginTop: 6 }}
            >+ Add item</button>
          )}
        </div>
      ))}
    </div>
  )
}
