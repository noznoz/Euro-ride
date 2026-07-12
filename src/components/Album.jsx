import { useEffect, useState } from 'react'
import { useCollection } from '../lib/useCollection.js'
import { useRider } from '../lib/RiderContext.jsx'
import { useRoster } from '../lib/useRoster.js'
import { useViewRider } from '../lib/ViewRiderContext.jsx'
import { listAllPhotos } from '../lib/photoStore.js'
import { itinerary } from '../data/trip.js'
import PhotoViewer from './PhotoViewer.jsx'

// Full-screen combined gallery of every rider's day photos.
export default function Album({ onClose }) {
  const { uid, remote } = useRider()
  const shared = useCollection('photos', { enabled: remote })
  const roster = useRoster(remote)
  const { openRider } = useViewRider()
  const [localPhotos, setLocalPhotos] = useState([])
  const [viewing, setViewing] = useState(null)

  useEffect(() => { if (!remote) listAllPhotos().then(setLocalPhotos).catch(() => {}) }, [remote])

  const photos = remote
    ? shared.items.map(p => ({ id: p.id, src: p.url, day: p.day, by: p.by, from: p.created_by, mine: p.created_by === uid, tags: p.tags }))
    : localPhotos.map(p => ({ id: p.id, src: p.dataUrl, day: Number(String(p.key).replace('day-', '')) }))

  const byDay = {}
  photos.forEach(p => { (byDay[p.day] = byDay[p.day] || []).push(p) })
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b)
  const titleOf = (day) => itinerary.find(d => d.day === day)?.title || `Day ${day}`

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>📸 Trip album · {photos.length}</span>
        <button onClick={onClose} style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>Done</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {photos.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 30 }}>
            No photos yet. Add some from any day on the Route tab 📷
          </div>
        )}
        {days.map(day => (
          <div key={day} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              <span style={{ color: 'var(--accent)' }}>Day {day}</span> · {titleOf(day)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {byDay[day].map(p => (
                <img key={p.id} src={p.src} alt="" onClick={() => setViewing(p)}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {viewing && (
        <PhotoViewer
          photo={viewing} roster={roster} meId={uid} openRider={openRider}
          onSaveTags={remote ? (tags) => { shared.update(viewing.id, { tags }); setViewing(v => ({ ...v, tags })) } : null}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  )
}
