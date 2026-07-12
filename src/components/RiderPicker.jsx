// Multi-select chip row for tagging riders. `value` is [{id,name}], roster
// the list to choose from, onChange returns the new selection.
export default function RiderPicker({ roster, value, onChange, meId, label = 'Tag riders' }) {
  const selected = new Set((value || []).map(v => v.id))
  const others = roster.filter(r => r.id !== meId)
  if (others.length === 0) return null

  const toggle = (r) => {
    if (selected.has(r.id)) onChange((value || []).filter(v => v.id !== r.id))
    else onChange([...(value || []), { id: r.id, name: r.name }])
  }

  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {others.map(r => {
          const on = selected.has(r.id)
          return (
            <button key={r.id} onClick={() => toggle(r)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 16, fontSize: 12,
              background: on ? 'var(--accent)' : 'var(--surface)',
              color: on ? '#0a0a0a' : 'var(--text)',
              border: '1px solid var(--border)', fontWeight: on ? 700 : 400,
            }}>
              <span>{r.photo ? '📷' : r.emoji}</span>{r.name}{on ? ' ✓' : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}
