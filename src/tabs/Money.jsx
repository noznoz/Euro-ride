import { useState } from 'react'
import { trip, expenseCategories } from '../data/trip.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'

const CURRENCIES = ['EUR', 'CHF']
const SYMBOL = { EUR: '€', CHF: 'CHF ' }

export default function Money() {
  const [expenses, setExpenses] = useLocalStorage('euroride.expenses.v1', [])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    amount: '', currency: trip.homeCurrency, category: 'fuel',
    payer: trip.riders[0]?.name || '', note: '',
  })

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

  // Totals per currency and per payer (per currency, so we never mix EUR + CHF)
  const totals = {}
  const byPayer = {}
  for (const e of expenses) {
    totals[e.currency] = (totals[e.currency] || 0) + e.amount
    byPayer[e.payer] = byPayer[e.payer] || {}
    byPayer[e.payer][e.currency] = (byPayer[e.payer][e.currency] || 0) + e.amount
  }

  const fmt = (amount, cur) => `${SYMBOL[cur] || cur + ' '}${amount.toFixed(2)}`
  const catOf = (id) => expenseCategories.find(c => c.id === id) || expenseCategories[expenseCategories.length - 1]

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 20 }}>💶 Money</h1>

      {/* Totals */}
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Trip total</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>
          {expenses.length === 0 ? '—' : Object.entries(totals).map(([cur, amt]) => fmt(amt, cur)).join(' + ')}
        </div>
        {Object.keys(byPayer).length > 1 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 16,
            marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            {Object.entries(byPayer).map(([payer, curs]) => (
              <div key={payer} style={{ fontSize: 12 }}>
                <div style={{ color: 'var(--text-muted)' }}>{payer} paid</div>
                <div style={{ fontWeight: 700 }}>{Object.entries(curs).map(([c, a]) => fmt(a, c)).join(' + ')}</div>
              </div>
            ))}
          </div>
        )}
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

          <select
            className="field"
            value={form.payer}
            onChange={e => setForm(f => ({ ...f, payer: e.target.value }))}
          >
            {trip.riders.map(r => <option key={r.name}>{r.name}</option>)}
          </select>

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
        return (
          <div key={e.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
            <span style={{ fontSize: 20 }}>{cat.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {cat.label}{e.note ? ` — ${e.note}` : ''}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.payer} · {e.date}</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{fmt(e.amount, e.currency)}</div>
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
