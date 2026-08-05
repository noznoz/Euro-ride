import { useState } from 'react'
import { useCollection } from '../lib/useCollection.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { useRider } from '../lib/RiderContext.jsx'

const CUR = ['EUR', 'SAR']

// Fuel fill-up log — liters, cost, optional odometer → totals + consumption.
export default function FuelLog({ fx }) {
  const { name, uid, remote } = useRider()
  const shared = useCollection('fuel', { enabled: remote })
  const [local, setLocal] = useLocalStorage(`euroride.${name}.fuel.v1`, [])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ liters: '', cost: '', currency: 'EUR', odo: '' })

  const items = (remote ? shared.items : local).slice().sort((a, b) => (b.ts || b.id) - (a.ts || a.id))
  const mine = remote ? items.filter(f => f.created_by === uid) : items

  const add = () => {
    const liters = parseFloat(form.liters), cost = parseFloat(form.cost)
    if (!liters && !cost) return
    const item = { id: Date.now(), ts: Date.now(), by: name, liters: liters || 0, cost: cost || 0, currency: form.currency, odo: parseFloat(form.odo) || null }
    if (remote) shared.upsert(item)
    else setLocal(l => [item, ...l])
    setForm({ liters: '', cost: '', currency: 'EUR', odo: '' })
  }
  const remove = (id) => { if (remote) shared.remove(id); else setLocal(l => l.filter(f => f.id !== id)) }

  // My totals + rough consumption between my two extreme odometers
  const myLiters = mine.reduce((s, f) => s + (f.liters || 0), 0)
  const mySAR = mine.reduce((s, f) => s + (f.cost || 0) * (fx[f.currency] ?? 1), 0)
  const odos = mine.filter(f => f.odo).map(f => f.odo).sort((a, b) => a - b)
  const dist = odos.length >= 2 ? odos[odos.length - 1] - odos[0] : 0
  const litersBetween = odos.length >= 2 ? mine.filter(f => f.odo && f.odo > odos[0]).reduce((s, f) => s + (f.liters || 0), 0) : 0
  const l100 = dist > 0 && litersBetween > 0 ? (litersBetween / dist) * 100 : 0

  return (
    <div className="card">
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 14 }}>⛽ Fuel log</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 14, marginBottom: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>⛽ {myLiters.toFixed(1)} L</span>
            <span>💶 €{(mySAR / fx.EUR).toFixed(0)} · SAR {mySAR.toFixed(0)}</span>
            {l100 > 0 && <span>📊 {l100.toFixed(1)} L/100km</span>}
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input className="field" type="number" inputMode="decimal" placeholder="Liters"
              value={form.liters} onChange={e => setForm(f => ({ ...f, liters: e.target.value }))} />
            <input className="field" type="number" inputMode="decimal" placeholder="Cost"
              value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
            <select className="field" style={{ width: 78, flexShrink: 0 }}
              value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              {CUR.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input className="field" type="number" inputMode="decimal" placeholder="Odometer km (optional)"
              value={form.odo} onChange={e => setForm(f => ({ ...f, odo: e.target.value }))} />
            <button onClick={add} style={{ background: 'var(--accent)', color: '#0a0a0a', fontWeight: 700, borderRadius: 10, padding: '0 16px', fontSize: 14, flexShrink: 0 }}>Add</button>
          </div>

          {mine.map(f => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '6px 0', borderTop: '1px solid var(--border)' }}>
              <span>{f.liters ? `${f.liters} L` : ''}{f.odo ? ` · ${f.odo} km` : ''}</span>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>{f.currency === 'SAR' ? 'SAR ' : '€'}{(f.cost || 0).toFixed(2)}</span>
                <button onClick={() => remove(f.id)} style={{ color: 'var(--text-muted)', fontSize: 13 }}>✕</button>
              </span>
            </div>
          ))}
          {mine.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No fill-ups logged yet.</div>}
        </div>
      )}
    </div>
  )
}
