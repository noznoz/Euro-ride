import { useEffect, useRef, useState } from 'react'
import { listDocs, addDoc, deleteDoc } from '../lib/docStore.js'
import { fileToDataUrl } from '../lib/photoStore.js'

const PRESETS = ['Passport', 'Int. Driving Permit', 'Insurance', 'Rental contract', 'Flight ticket', 'Other']

export default function Documents() {
  const [docs, setDocs] = useState([])
  const [viewing, setViewing] = useState(null)
  const [busy, setBusy] = useState(false)
  const pendingLabel = useRef('Document')
  const inputRef = useRef(null)

  useEffect(() => { listDocs().then(setDocs).catch(() => {}) }, [])

  const startAdd = (label) => { pendingLabel.current = label; inputRef.current?.click() }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const dataUrl = await fileToDataUrl(file, 1800, 0.85)
      await addDoc(pendingLabel.current, dataUrl)
      setDocs(await listDocs())
    } catch { alert('Could not save that document — storage may be full.') }
    setBusy(false)
  }

  const remove = async (id) => {
    if (!confirm('Delete this document from your phone?')) return
    await deleteDoc(id)
    setDocs(d => d.filter(x => x.id !== id))
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: 14, marginBottom: 4 }}>🗂️ My documents</h2>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
        🔒 Private — stored only on this phone, never uploaded. Works offline.
      </div>

      {docs.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
          {docs.map(d => (
            <div key={d.id} style={{ position: 'relative' }}>
              <img src={d.dataUrl} alt={d.label} onClick={() => setViewing(d)}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 8, cursor: 'pointer' }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                color: '#fff', fontSize: 10, padding: '10px 4px 3px', borderRadius: '0 0 8px 8px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{d.label}</div>
              <button onClick={() => remove(d.id)} style={{
                position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.65)',
                borderRadius: '50%', width: 20, height: 20, fontSize: 11, color: '#fff',
              }}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Add a photo of:</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PRESETS.map(p => (
          <button key={p} onClick={() => startAdd(p)} disabled={busy} style={{
            padding: '6px 10px', borderRadius: 8, fontSize: 12,
            background: 'var(--surface)', border: '1px solid var(--border)',
            opacity: busy ? 0.5 : 1,
          }}>+ {p}</button>
        ))}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

      {viewing && (
        <div onClick={() => setViewing(null)} style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.94)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <img src={viewing.dataUrl} alt="" style={{ maxWidth: '96%', maxHeight: '86%', borderRadius: 8 }} />
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{viewing.label}</div>
        </div>
      )}
    </div>
  )
}
