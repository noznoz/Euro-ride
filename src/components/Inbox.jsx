import { useEffect, useRef, useState } from 'react'

function ago(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`
  const d = Math.floor(h / 24); if (d < 7) return `${d}d`
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// Full-screen Inbox. `msgs` is the useMessages() result; `roster` the riders.
export default function Inbox({ rider, roster, msgs, lastRead, initialPartner, onClose }) {
  const [partner, setPartner] = useState(initialPartner || null)
  const others = roster.filter(r => r.id !== rider.uid)

  const partnerOf = (m) => (m.created_by === rider.uid ? m.to_id : m.created_by)
  const lastWith = (id) => {
    const th = msgs.items.filter(m => partnerOf(m) === id)
    return th.length ? th[th.length - 1] : null
  }
  const unreadFrom = (id) =>
    msgs.items.filter(m => m.created_by === id && m.to_id === rider.uid && (m.ts || m.id) > lastRead).length

  if (partner) {
    const p = others.find(r => r.id === partner) || { id: partner, name: 'Rider', emoji: '🏍️' }
    return <Thread rider={rider} partner={p} msgs={msgs} onBack={() => setPartner(null)} onClose={onClose} />
  }

  return (
    <Screen title="✉️ Inbox" onClose={onClose}>
      {others.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 24 }}>
          No other riders yet. Once the crew signs up you can message them here.
        </div>
      )}
      {others.map(r => {
        const last = lastWith(r.id)
        const unread = unreadFrom(r.id)
        return (
          <button key={r.id} onClick={() => setPartner(r.id)} style={{
            width: '100%', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center',
            padding: 12, borderBottom: '1px solid var(--border)',
          }}>
            <Avatar r={r} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {last ? `${last.created_by === rider.uid ? 'You: ' : ''}${last.text}` : 'Tap to start a conversation'}
              </div>
            </div>
            {last && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ago(last.ts || last.id)}</span>}
            {unread > 0 && <Badge n={unread} />}
          </button>
        )
      })}
    </Screen>
  )
}

function Thread({ rider, partner, msgs, onBack, onClose }) {
  const [text, setText] = useState('')
  const endRef = useRef(null)
  const thread = msgs.items
    .filter(m => (m.created_by === partner.id && m.to_id === rider.uid) || (m.created_by === rider.uid && m.to_id === partner.id))
    .sort((a, b) => (a.ts || a.id) - (b.ts || b.id))

  useEffect(() => { endRef.current?.scrollIntoView() }, [thread.length])

  const send = () => {
    const t = text.trim()
    if (!t) return
    msgs.send({ toId: partner.id, toName: partner.name, fromName: rider.name, text: t })
    setText('')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{ fontSize: 20, color: 'var(--accent)' }}>‹</button>
        <Avatar r={partner} size={30} />
        <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{partner.name}</span>
        <button onClick={onClose} style={{ fontSize: 13, color: 'var(--text-muted)' }}>Close</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {thread.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 20 }}>
            Say hi to {partner.name} 👋
          </div>
        )}
        {thread.map(m => {
          const mine = m.created_by === rider.uid
          return (
            <div key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '78%' }}>
              <div style={{
                background: mine ? 'var(--accent)' : 'var(--card)',
                color: mine ? '#0a0a0a' : 'var(--text)',
                border: mine ? 'none' : '1px solid var(--border)',
                borderRadius: 14, padding: '8px 12px', fontSize: 14, lineHeight: 1.4, whiteSpace: 'pre-wrap',
              }}>{m.text}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: mine ? 'right' : 'left', marginTop: 2 }}>
                {ago(m.ts || m.id)}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      <div style={{
        display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)', background: 'var(--surface)',
      }}>
        <input className="field" placeholder={`Message ${partner.name}…`} value={text}
          onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        <button onClick={send} disabled={!text.trim()} style={{
          background: 'var(--accent)', color: '#0a0a0a', fontWeight: 700, borderRadius: 10,
          padding: '0 18px', fontSize: 14, opacity: text.trim() ? 1 : 0.5,
        }}>Send</button>
      </div>
    </div>
  )
}

function Screen({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
        <button onClick={onClose} style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>Done</button>
      </header>
      <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
    </div>
  )
}

function Avatar({ r, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--surface)', border: '2px solid var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45, overflow: 'hidden',
    }}>
      {r.photo ? <img src={r.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (r.emoji || '🏍️')}
    </div>
  )
}

function Badge({ n }) {
  return (
    <span style={{
      background: 'var(--accent)', color: '#0a0a0a', fontSize: 11, fontWeight: 800,
      minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{n}</span>
  )
}
