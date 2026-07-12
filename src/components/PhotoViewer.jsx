import { useState } from 'react'
import RiderPicker from './RiderPicker.jsx'

// Full-screen photo with tappable uploader/tags and (for the owner) tagging.
export default function PhotoViewer({ photo, roster, meId, openRider, onSaveTags, onClose }) {
  const [tagging, setTagging] = useState(false)
  const [draft, setDraft] = useState(photo.tags || [])
  const tags = photo.tags || []
  const canTag = photo.mine && roster.length > 1 && onSaveTags

  const save = () => { onSaveTags(draft); setTagging(false) }
  const tap = (id) => { if (id && openRider) { onClose(); openRider(id) } }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(0,0,0,0.95)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        onClick={() => !tagging && onClose()}>
        <img src={photo.src} alt="" style={{ maxWidth: '96%', maxHeight: '100%', borderRadius: 8 }} />
      </div>

      <div style={{ padding: 14, paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        {photo.by && (
          <div style={{ fontSize: 13, marginBottom: tags.length || canTag ? 8 : 0 }}>
            📷 <button onClick={() => tap(photo.from)} style={{ color: 'var(--accent)', fontWeight: 700 }}>{photo.by}</button>
          </div>
        )}

        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: canTag ? 8 : 0 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🏷️</span>
            {tags.map(t => (
              <button key={t.id} onClick={() => tap(t.id)} style={{
                fontSize: 12, color: 'var(--accent)', fontWeight: 600,
              }}>{t.name}</button>
            ))}
          </div>
        )}

        {canTag && !tagging && (
          <button onClick={() => { setDraft(tags); setTagging(true) }} style={{ fontSize: 13, color: 'var(--accent)' }}>
            🏷️ Tag riders
          </button>
        )}
        {canTag && tagging && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <RiderPicker roster={roster} value={draft} onChange={setDraft} meId={meId} label="Who's in this photo?" />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setTagging(false)} style={{ flex: 1, padding: 8, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', fontSize: 13 }}>Cancel</button>
              <button onClick={save} style={{ flex: 2, padding: 8, borderRadius: 8, background: 'var(--accent)', color: '#0a0a0a', fontWeight: 700, fontSize: 13 }}>Save tags</button>
            </div>
          </div>
        )}

        {!tagging && (
          <button onClick={onClose} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 12px)', right: 16, fontSize: 22, color: '#fff' }}>✕</button>
        )}
      </div>
    </div>
  )
}
