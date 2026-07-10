import { useEffect, useRef, useState } from 'react'
import { listPhotos, addPhoto, deletePhoto, fileToDataUrl } from '../lib/photoStore.js'

export default function PhotoStrip({ storageKey }) {
  const [photos, setPhotos] = useState([])
  const [viewing, setViewing] = useState(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { listPhotos(storageKey).then(setPhotos).catch(() => {}) }, [storageKey])

  const onFile = async (e) => {
    const files = [...e.target.files]
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    try {
      for (const file of files) {
        const dataUrl = await fileToDataUrl(file)
        await addPhoto(storageKey, dataUrl)
      }
      setPhotos(await listPhotos(storageKey))
    } catch {
      alert('Could not save that photo — storage may be full.')
    }
    setBusy(false)
  }

  const remove = async (id) => {
    await deletePhoto(id)
    setPhotos(p => p.filter(x => x.id !== id))
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {photos.map(p => (
          <div key={p.id} style={{ position: 'relative' }}>
            <img
              src={p.dataUrl} alt=""
              onClick={() => setViewing(p.dataUrl)}
              style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }}
            />
            <button onClick={() => remove(p.id)} style={{
              position: 'absolute', top: 2, right: 2,
              background: 'rgba(0,0,0,0.65)', borderRadius: '50%',
              width: 20, height: 20, fontSize: 11, lineHeight: '20px',
              color: '#fff',
            }}>✕</button>
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
        <div
          onClick={() => setViewing(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <img src={viewing} alt="" style={{ maxWidth: '95%', maxHeight: '90%', borderRadius: 10 }} />
        </div>
      )}
    </div>
  )
}
