import { useEffect, useRef, useState } from 'react'
import { listPhotos, addPhoto, deletePhoto, fileToDataUrl } from '../lib/photoStore.js'
import { useCollection } from '../lib/useCollection.js'
import { uploadImage } from '../lib/upload.js'
import { useRider } from '../lib/RiderContext.jsx'
import { useRoster } from '../lib/useRoster.js'
import { useViewRider } from '../lib/ViewRiderContext.jsx'
import PhotoViewer from './PhotoViewer.jsx'

// Photos for one itinerary day.
// Shared mode: uploaded to Supabase storage — the whole group sees them.
// Local mode: compressed into IndexedDB on this device only.
export default function PhotoStrip({ day }) {
  const { name, uid, remote } = useRider()
  const shared = useCollection('photos', { enabled: remote })
  const roster = useRoster(remote)
  const { openRider } = useViewRider()
  const [localPhotos, setLocalPhotos] = useState([])
  const [viewing, setViewing] = useState(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  const localKey = `day-${day}`
  useEffect(() => {
    if (!remote) listPhotos(localKey).then(setLocalPhotos).catch(() => {})
  }, [localKey, remote])

  const photos = remote
    ? shared.items.filter(p => p.day === day).map(p => ({ id: p.id, src: p.url, mine: p.created_by === uid, by: p.by, from: p.created_by, tags: p.tags }))
    : localPhotos.map(p => ({ id: p.id, src: p.dataUrl, mine: true }))

  const onFile = async (e) => {
    const files = [...e.target.files]
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    try {
      for (const file of files) {
        if (remote) {
          const url = await uploadImage(file, `day-${day}`)
          if (url) await shared.upsert({ id: Date.now() + Math.random(), day, url, by: name })
        } else {
          const dataUrl = await fileToDataUrl(file)
          await addPhoto(localKey, dataUrl)
        }
      }
      if (!remote) setLocalPhotos(await listPhotos(localKey))
    } catch {
      alert('Could not save that photo — check your connection or storage.')
    }
    setBusy(false)
  }

  const remove = async (p) => {
    if (remote) shared.remove(p.id)
    else {
      await deletePhoto(p.id)
      setLocalPhotos(list => list.filter(x => x.id !== p.id))
    }
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {photos.map(p => (
          <div key={p.id} style={{ position: 'relative' }}>
            <img
              src={p.src} alt={p.by ? `by ${p.by}` : ''}
              onClick={() => setViewing(p)}
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
            />
            {p.mine && (
              <button onClick={() => remove(p)} style={{
                position: 'absolute', top: 2, right: 2,
                background: 'rgba(0,0,0,0.65)', borderRadius: '50%',
                width: 20, height: 20, fontSize: 11, lineHeight: '20px',
                color: '#fff',
              }}>✕</button>
            )}
          </div>
        ))}
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          style={{
            aspectRatio: '1', borderRadius: 8,
            border: '1px dashed var(--border)', color: 'var(--text-muted)',
            fontSize: 20, background: 'var(--surface)',
          }}
        >{busy ? '…' : '📷+'}</button>
      </div>
      <input
        ref={inputRef} type="file" accept="image/*" multiple
        onChange={onFile} style={{ display: 'none' }}
      />

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
