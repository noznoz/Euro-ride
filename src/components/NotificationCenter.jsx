function ago(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Derived activity feed: new announcements (by others) + messages received.
// No separate table — computed from what we already sync.
export default function NotificationCenter({ rider, announcements, messages, lastSeen, onOpenNews, onOpenThread, onClose }) {
  const annNotifs = announcements
    .filter(a => a.by !== rider.name) // your own posts aren't notifications
    .map(a => ({ id: 'a' + a.id, type: 'ann', ts: a.ts || a.id, who: a.by, text: a.text }))

  const msgNotifs = messages
    .filter(m => m.to_id === rider.uid && m.created_by !== rider.uid)
    .map(m => ({ id: 'm' + m.id, type: 'msg', ts: m.ts || m.id, who: m.fromName, text: m.text, from: m.created_by }))

  const feed = [...annNotifs, ...msgNotifs].sort((a, b) => b.ts - a.ts).slice(0, 60)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🔔 Notifications</span>
        <button onClick={onClose} style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>Done</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {feed.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 30 }}>
            You're all caught up 🎉
          </div>
        )}
        {feed.map(n => {
          const unread = n.ts > lastSeen
          const open = () => n.type === 'ann' ? onOpenNews() : onOpenThread(n.from)
          return (
            <button key={n.id} onClick={open} style={{
              width: '100%', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: 14, borderBottom: '1px solid var(--border)',
              background: unread ? 'rgba(242,178,30,0.06)' : 'transparent',
            }}>
              <span style={{ fontSize: 20 }}>{n.type === 'ann' ? '📣' : '✉️'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {n.type === 'ann' ? `${n.who} posted an announcement` : `Message from ${n.who}`}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {n.text}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ago(n.ts)}</div>
              </div>
              {unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
