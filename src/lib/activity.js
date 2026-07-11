// Build a unified activity feed for the Notification Center from every
// shared data source. Each entry: { id, type, ts, who, text, target, from }.
// `target` is the tab to open on tap ('news','money','trip','route','profile')
// or 'inbox' (with `from` = the sender's uid).
export function buildActivity({ rider, roster = [], announcements = [], expenses = [], reservations = [], completions = [], photos = [], messages = [] }) {
  const me = rider.uid
  const myName = rider.name
  const out = []

  roster.forEach(r => {
    if (r.id === me || !r.joinedTs) return
    out.push({ id: 'j' + r.id, type: 'join', ts: r.joinedTs, who: r.name, text: 'joined the chapter 🎉', target: 'profile' })
  })
  announcements.forEach(a => {
    if (a.by === myName) return
    out.push({ id: 'a' + a.id, type: 'ann', ts: a.ts || a.id, who: a.by, text: a.text, target: 'news' })
  })
  expenses.forEach(e => {
    if (e.created_by === me) return
    const amt = e.amount != null ? ` (${e.currency || ''} ${e.amount})` : ''
    out.push({ id: 'e' + e.id, type: 'expense', ts: e.id, who: e.by, text: `added an expense${amt}`, target: 'money' })
  })
  reservations.forEach(r => {
    if (r.created_by === me) return
    out.push({ id: 'r' + r.id, type: 'reservation', ts: r.id, who: r.by, text: `added a reservation: ${r.label || ''}`, target: 'trip' })
  })
  completions.forEach(c => {
    if (c.created_by === me) return
    out.push({ id: 'c' + c.id, type: 'ride', ts: c.id, who: c.by, text: `completed a ride day (+${c.km || 0} km)`, target: 'route' })
  })
  photos.forEach(p => {
    if (p.created_by === me) return
    out.push({ id: 'p' + p.id, type: 'photo', ts: p.id, who: p.by, text: 'added a photo 📷', target: 'route' })
  })
  messages.forEach(m => {
    if (m.to_id !== me || m.created_by === me) return
    out.push({ id: 'm' + m.id, type: 'msg', ts: m.ts || m.id, who: m.fromName, text: m.text, target: 'inbox', from: m.created_by })
  })

  return out.sort((a, b) => b.ts - a.ts).slice(0, 80)
}

export const NOTIF_ICON = {
  join: '👋', ann: '📣', expense: '💶', reservation: '🎫', ride: '🏁', photo: '📷', msg: '✉️',
}

export function notifTitle(n) {
  switch (n.type) {
    case 'join': return `${n.who} joined`
    case 'ann': return `${n.who} posted an announcement`
    case 'expense': return `${n.who} ${n.text}`
    case 'reservation': return `${n.who} ${n.text}`
    case 'ride': return `${n.who} ${n.text}`
    case 'photo': return `${n.who} added a photo`
    case 'msg': return `Message from ${n.who}`
    default: return n.who || 'Activity'
  }
}
