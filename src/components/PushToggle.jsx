import { useEffect, useState } from 'react'
import { useRider } from '../lib/RiderContext.jsx'
import { pushSupported, pushStatus, enablePush, disablePush } from '../lib/push.js'

export default function PushToggle() {
  const { uid, name, remote } = useRider()
  const [status, setStatus] = useState('off')
  const [busy, setBusy] = useState(false)

  useEffect(() => { if (remote) pushStatus().then(setStatus) }, [remote])

  if (!remote || !pushSupported()) return null

  const toggle = async () => {
    setBusy(true)
    try {
      if (status === 'on') setStatus(await disablePush())
      else setStatus(await enablePush(uid, name))
    } catch (e) {
      if (String(e.message) === 'denied') alert('Notifications are blocked. Enable them for this site in your browser settings.')
    }
    setBusy(false)
  }

  const on = status === 'on'
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 22 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>Push notifications</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {status === 'denied'
            ? 'Blocked in browser settings'
            : on ? 'On — you\'ll be pinged for messages, tags & announcements' : 'Get pinged even when the app is closed'}
        </div>
      </div>
      <button onClick={toggle} disabled={busy || status === 'denied'} style={{
        fontSize: 13, fontWeight: 700, borderRadius: 20, padding: '7px 16px',
        background: on ? 'var(--surface)' : 'var(--accent)',
        color: on ? 'var(--text)' : '#0a0a0a',
        border: on ? '1px solid var(--border)' : 'none',
        opacity: busy ? 0.6 : 1,
      }}>{busy ? '…' : on ? 'Turn off' : 'Enable'}</button>
    </div>
  )
}
