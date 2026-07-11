import { NOTIF_ICON, notifTitle } from '../lib/activity.js'

function ago(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Full activity feed: joins, announcements, expenses, reservations, ride
// completions, photos and messages. Tapping an item opens where it lives.
export default function NotificationCenter({ activity, lastSeen, onNavigate, onOpenThread, onClose }) {
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
        {activity.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 30 }}>
            You're all caught up 🎉
          </div>
        )}
        {activity.map(n => {
          const unread = n.ts > lastSeen
          const open = () => {
            if (n.type === 'msg') onOpenThread(n.from)
            else onNavigate(n.target)
          }
          const showBody = n.type === 'ann' || n.type === 'msg'
          return (
            <button key={n.id} onClick={open} style={{
              width: '100%', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: 14, borderBottom: '1px solid var(--border)',
              background: unread ? 'rgba(242,178,30,0.06)' : 'transparent',
            }}>
              <span style={{ fontSize: 20 }}>{NOTIF_ICON[n.type] || '•'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{notifTitle(n)}</div>
                {showBody && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.text}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{ago(n.ts)} · tap to open</div>
              </div>
              {unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
