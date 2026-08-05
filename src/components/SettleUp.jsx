import { useState } from 'react'
import { useRoster } from '../lib/useRoster.js'
import { useRider } from '../lib/RiderContext.jsx'

// Split shared expenses evenly and compute a minimal set of "X pays Y" transfers.
export default function SettleUp({ expenses, fx }) {
  const { remote } = useRider()
  const roster = useRoster(remote)
  const [open, setOpen] = useState(false)

  if (!remote || roster.length < 2 || expenses.length === 0) return null

  const toSAR = (e) => e.amount * (fx[e.currency] ?? 1)
  const total = expenses.reduce((s, e) => s + toSAR(e), 0)
  const share = total / roster.length

  // Paid per rider (SAR)
  const paid = {}
  roster.forEach(r => { paid[r.id] = 0 })
  expenses.forEach(e => { if (e.created_by in paid) paid[e.created_by] += toSAR(e) })

  // Balance = paid - share  (positive → owed money, negative → owes)
  const bal = roster.map(r => ({ id: r.id, name: r.name, net: (paid[r.id] || 0) - share }))
  const debtors = bal.filter(b => b.net < -0.01).map(b => ({ ...b })).sort((a, b) => a.net - b.net)
  const creditors = bal.filter(b => b.net > 0.01).map(b => ({ ...b })).sort((a, b) => b.net - a.net)

  // Greedy settle
  const transfers = []
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(-debtors[i].net, creditors[j].net)
    if (amt > 0.5) transfers.push({ from: debtors[i].name, to: creditors[j].name, sar: amt })
    debtors[i].net += amt
    creditors[j].net -= amt
    if (Math.abs(debtors[i].net) < 0.5) i++
    if (creditors[j].net < 0.5) j++
  }

  const fmtBoth = (sar) => `€${(sar / fx.EUR).toFixed(0)} · SAR ${sar.toFixed(0)}`

  return (
    <div className="card">
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 14 }}>💸 Settle up · split {roster.length} ways</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Fair share each: <strong>{fmtBoth(share)}</strong>
          </div>
          {transfers.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--green)' }}>All square — everyone's even 🎉</div>
          ) : (
            transfers.map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderTop: '1px solid var(--border)' }}>
                <span><strong>{t.from}</strong> → <strong style={{ color: 'var(--accent)' }}>{t.to}</strong></span>
                <span style={{ fontWeight: 700 }}>{fmtBoth(t.sar)}</span>
              </div>
            ))
          )}
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>
            Based on all shared expenses, split evenly across signed-up riders.
          </div>
        </div>
      )}
    </div>
  )
}
