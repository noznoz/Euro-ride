// Build a unified activity feed for the Notification Center from every
// shared data source. Each entry: { id, type, ts, who, text, target, from }.
// `target` is the tab to open on tap ('news','money','trip','route','profile')
// or 'inbox' (with `from` = the sender's uid).
export function buildActivity({ rider, roster = [], announcements = [], completions = [], photos = [], messages = [], pending = [] }) {
  const me = rider.uid
  const myName = rider.name
  const iAmTagged = (tags) => Array.isArray(tags) && tags.some(t => t.id === me)
  const out = []

  // Admin only: riders waiting for approval
  if (rider.isAdmin) {
    pending.forEach(p => {
      out.push({ id: 'pend' + p.id, type: 'pending', ts: p.joinedTs || p.id, who: p.name, text: 'is waiting for approval', target: 'profile' })
    })
  }

  roster.forEach(r => {
    if (r.id === me || !r.joinedTs) return
    out.push({ id: 'j' + r.id, type: 'join', ts: r.joinedTs, who: r.name, text: 'joined the chapter 🎉', target: 'profile' })
  })
  announcements.forEach(a => {
    if (a.by === myName) return
    const tagged = iAmTagged(a.tags)
    out.push({
      id: 'a' + a.id, type: tagged ? 'tagpost' : 'ann', ts: a.ts || a.id,
      who: a.by, text: a.text, target: 'news', from: a.created_by,
    })
  })
  completions.forEach(c => {
    if (c.created_by === me) return
    out.push({ id: 'c' + c.id, type: 'ride', ts: c.id, who: c.by, text: `completed a ride day (+${c.km || 0} km)`, target: 'route', from: c.created_by })
  })
  photos.forEach(p => {
    if (p.created_by === me) return
    const tagged = iAmTagged(p.tags)
    out.push({ id: 'p' + p.id, type: tagged ? 'tagphoto' : 'photo', ts: p.id, who: p.by, text: 'a photo 📷', target: 'route', from: p.created_by })
  })
  messages.forEach(m => {
    if (m.to_id !== me || m.created_by === me) return
    out.push({ id: 'm' + m.id, type: 'msg', ts: m.ts || m.id, who: m.fromName, text: m.text, target: 'inbox', from: m.created_by })
  })

  return out.sort((a, b) => b.ts - a.ts).slice(0, 80)
}

export const NOTIF_ICON = {
  pending: '⏳', join: '👋', ann: '📣', ride: '🏁', photo: '📷', msg: '✉️', tagpost: '🏷️', tagphoto: '🏷️',
}

export function notifTitle(n) {
  switch (n.type) {
    case 'pending': return `${n.who} ${n.text}`
    case 'join': return `${n.who} joined`
    case 'ann': return `${n.who} posted an announcement`
    case 'ride': return `${n.who} ${n.text}`
    case 'photo': return `${n.who} added a photo`
    case 'tagpost': return `${n.who} tagged you in a post`
    case 'tagphoto': return `${n.who} tagged you in a photo`
    case 'msg': return `Message from ${n.who}`
    default: return n.who || 'Activity'
  }
}
