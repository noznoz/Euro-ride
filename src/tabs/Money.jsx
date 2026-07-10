import { useState } from 'react'
import { fx, expenseCategories } from '../data/trip.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { useProfile } from '../lib/ProfileContext.jsx'

const CURRENCIES = ['EUR', 'CHF', 'SAR']
const SYMBOL = { EUR: '€', CHF: 'CHF ', SAR: 'SAR ' }

const fmt = (amount, cur) => `${SYMBOL[cur] || cur + ' '}${amount.toFixed(2)}`
const toSAR = (amount, cur) => amount * (fx[cur] ?? 1)
const sarToEur = (sar) => sar / fx.EUR

export default function Money() {
  const { profile } = useProfile()
  const [expenses, setExpenses] = useLocalStorage(`euroride.${profile}.expenses.v1`, [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ amount: '', currency: 'EUR', category: 'fuel', note: '' })

  const add = () => {
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0) return
    setExpenses(list => [
      { ...form, amount, id: Date.now(), date: new Date().toISOString().slice(0, 10) },
      ...list,
    ])
    setForm(f => ({ ...f, amount: '', note: '' }))
    setShowForm(false)
  }

  const remove = (id) => setExpenses(list => list.filter(e => e.id !== id))

  const totalSAR = expenses.reduce((s, e) => s + toSAR(e.amount, e.currency), 0)
  const totalEUR = sarToEur(totalSAR)

  const catOf = (id) => expenseCategories.find(c => c.id === id) || expenseCategories[expenseCategories.length - 1]

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 20 }}>💶 Money — {profile}</h1>

      {/* Totals in both currencies */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>My trip total</div>
        {expenses.length === 0 ? (
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>—</div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 6, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>{fmt(totalEUR, 'EUR')}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>in Euro</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)' }}>{fmt(totalSAR, 'SAR')}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>in Riyal</div>
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
          Rates: €1 = SAR {fx.EUR.toFixed(2)} · CHF 1 = SAR {fx.CHF.toFixed(2)} (edit in trip.js)
        </div>
      </div>

      {/* Add */}
      {showForm ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              className="field"
              type="number" inputMode="decimal" min="0" step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            />
            <select
              className="field" style={{ width: 90, flexShrink: 0 }}
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            >
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {expenseCategories.map(c => (
              <button key={c.id}
                onClick={() => setForm(f => ({ ...f, category: c.id }))}
                style={{
                  padding: '6px 10px', borderRadius: 8, fontSize: 13,
                  background: form.category === c.id ? 'var(--accent)' : 'var(--surface)',
                  color: form.category === c.id ? '#0a0a0a' : 'var(--text)',
                  border: '1px solid var(--border)', fontWeight: form.category === c.id ? 700 : 400,
                }}
              >{c.emoji} {c.label}</button>
            ))}
          </div>

          <input
            className="field"
            placeholder="Note (optional)"
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && add()}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowForm(false)} style={{
              flex: 1, padding: 10, borderRadius: 10, background: 'var(--surface)',
              border: '1px solid var(--border)', fontSize: 14,
            }}>Cancel</button>
            <button onClick={add} style={{
              flex: 2, padding: 10, borderRadius: 10, background: 'var(--accent)',
              color: '#0a0a0a', fontWeight: 700, fontSize: 14,
            }}>Add expense</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} style={{
          padding: 12, borderRadius: 12, background: 'var(--accent)',
          color: '#0a0a0a', fontWeight: 700, fontSize: 15,
        }}>+ Add expense</button>
      )}

      {/* List */}
      {expenses.map(e => {
        const cat = catOf(e.category)
        const converted = e.currency === 'SAR'
          ? fmt(sarToEur(e.amount), 'EUR')
          : fmt(toSAR(e.amount, e.currency), 'SAR')
        return (
          <div key={e.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
            <span style={{ fontSize: 20 }}>{cat.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {cat.label}{e.note ? ` — ${e.note}` : ''}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.date}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{fmt(e.amount, e.currency)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>≈ {converted}</div>
            </div>
            <button onClick={() => remove(e.id)} style={{ color: 'var(--text-muted)', fontSize: 14 }}>✕</button>
          </div>
        )
      })}

      {expenses.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 20 }}>
          No expenses yet. Fuel stop coming soon ⛽
        </div>
      )}
    </div>
  )
}
