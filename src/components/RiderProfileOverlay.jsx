// Read-only full-screen view of any rider's profile.
export default function RiderProfileOverlay({ rider, onClose, onMessage }) {
  if (!rider) return null
  const d = rider.data || {}
  const rows = [
    ['🏍️ Bike', d.bike],
    ['📍 Home', d.city],
    ['📅 Years riding', d.years],
    ['🩸 Blood type', d.blood],
    ['⚕️ Allergies / meds', d.allergies],
    ['🆘 Emergency', [d.emergencyName, d.emergencyPhone].filter(Boolean).join(' · ')],
    ['📸 Instagram', d.instagram],
    ['📱 Phone', d.phone],
  ].filter(([, v]) => v)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Rider</span>
        <button onClick={onClose} style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>Done</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            background: 'var(--surface)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 42, overflow: 'hidden',
          }}>
            {rider.photo ? <img src={rider.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (rider.emoji || '🏍️')}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>
            {rider.name} {rider.role === 'admin' && <span style={{ fontSize: 11, color: 'var(--gold)' }}>★ ADMIN</span>}
          </div>
          {d.bio && <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>{d.bio}</div>}
          {onMessage && (
            <button onClick={() => onMessage(rider.id)} style={{
              marginTop: 4, background: 'var(--accent)', color: '#0a0a0a', fontWeight: 700,
              borderRadius: 20, padding: '8px 20px', fontSize: 14,
            }}>✉️ Message</button>
          )}
        </div>

        {rows.length > 0 ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rows.map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)', width: 140, flexShrink: 0 }}>{label}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 10 }}>
            {rider.name} hasn't filled in their profile yet.
          </div>
        )}
      </div>
    </div>
  )
}
