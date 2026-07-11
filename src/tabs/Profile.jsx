import { useRef, useState } from 'react'
import { useRider } from '../lib/RiderContext.jsx'
import { useAuth } from '../lib/AuthContext.jsx'
import { useRoster } from '../lib/useRoster.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { uploadImage } from '../lib/upload.js'
import { fileToDataUrl } from '../lib/photoStore.js'

const EMOJIS = ['🏍️', '😎', '🔥', '🦅', '🤘', '🧔', '👑', '⚡', '🌟', '🐺']

const FIELDS = [
  { key: 'bike', label: 'My bike', icon: '🏍️', placeholder: 'e.g. Street Glide CVO' },
  { key: 'years', label: 'Years riding', icon: '📅', placeholder: 'e.g. 12' },
  { key: 'city', label: 'Home city', icon: '📍', placeholder: 'e.g. Jeddah' },
  { key: 'bio', label: 'About me', icon: '💬', placeholder: 'A line or two about you', area: true },
  { key: 'blood', label: 'Blood type', icon: '🩸', placeholder: 'e.g. O+', safety: true },
  { key: 'allergies', label: 'Allergies / meds', icon: '⚕️', placeholder: 'e.g. Penicillin', safety: true },
  { key: 'emergencyName', label: 'Emergency contact', icon: '🆘', placeholder: 'Name', safety: true },
  { key: 'emergencyPhone', label: 'Emergency phone', icon: '📞', placeholder: '+966 …', safety: true, tel: true },
  { key: 'instagram', label: 'Instagram', icon: '📸', placeholder: '@handle' },
  { key: 'phone', label: 'Phone', icon: '📱', placeholder: '+966 …', tel: true },
]

export default function Profile() {
  const { name, remote } = useRider()
  const { profile, updateProfile } = useAuth()
  const [localProfile, setLocalProfile] = useLocalStorage(`euroride.${name}.profileinfo.v1`, {})
  const roster = useRoster(remote)

  const me = remote ? { name: profile?.name || name, ...(profile?.data || {}) } : { name, ...localProfile }

  const save = async (patch) => {
    if (remote) await updateProfile(patch)
    else setLocalProfile(p => ({ ...p, ...patch }))
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h1 style={{ fontSize: 20 }}>👤 Profile</h1>

      <MyProfileCard me={me} save={save} remote={remote} />

      {remote && roster.length > 0 && (
        <div>
          <h2 style={{ fontSize: 15, margin: '4px 2px 10px' }}>🦅 The Chapter — {roster.length} riders</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {roster.map(r => <RiderCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {!remote && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 10 }}>
          You're in local mode — your profile stays on this device.
        </div>
      )}
    </div>
  )
}

function Avatar({ photo, emoji, size = 84, ring = true }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'var(--surface)', border: ring ? '2px solid var(--accent)' : '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, overflow: 'hidden',
    }}>
      {photo ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (emoji || '🏍️')}
    </div>
  )
}

function MyProfileCard({ me, save, remote }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(me)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  const start = () => { setDraft(me); setEditing(true) }
  const commit = async () => { setBusy(true); await save(draft); setBusy(false); setEditing(false) }

  const pickPhoto = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const photo = remote ? await uploadImage(file, 'avatars') : await fileToDataUrl(file, 700, 0.8)
      if (photo) { setDraft(d => ({ ...d, photo })); if (!editing) await save({ photo }) }
    } catch { alert('Could not upload that photo.') }
    setBusy(false)
  }

  if (!editing) {
    return (
      <div className="card">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <Avatar photo={me.photo} emoji={me.emoji} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 800 }}>{me.name}</div>
            {me.bike && <div style={{ fontSize: 13, color: 'var(--accent)' }}>🏍️ {me.bike}</div>}
            {me.city && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {me.city}{me.years ? ` · ${me.years} yrs riding` : ''}</div>}
          </div>
          <button onClick={start} style={{
            background: 'var(--accent)', color: '#0a0a0a', fontWeight: 700,
            borderRadius: 20, padding: '7px 14px', fontSize: 13,
          }}>Edit</button>
        </div>

        {me.bio && <div style={{ fontSize: 13, marginTop: 12, lineHeight: 1.5 }}>{me.bio}</div>}

        <Details me={me} />
      </div>
    )
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <button onClick={() => inputRef.current?.click()} disabled={busy} style={{ position: 'relative' }}>
          <Avatar photo={draft.photo} emoji={draft.emoji} />
          <span style={{
            position: 'absolute', bottom: 0, right: 0, background: 'var(--accent)',
            color: '#0a0a0a', borderRadius: '50%', width: 26, height: 26, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
          }}>{busy ? '…' : '📷'}</span>
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
        <input
          className="field" placeholder="Your name"
          value={draft.name || ''}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
        />
      </div>

      {/* Emoji avatar fallback */}
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Pick an avatar emoji (shown if no photo)</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {EMOJIS.map(em => (
            <button key={em} onClick={() => setDraft(d => ({ ...d, emoji: em }))} style={{
              width: 38, height: 38, borderRadius: 10, fontSize: 18,
              background: draft.emoji === em ? 'var(--accent)' : 'var(--surface)',
              border: '1px solid var(--border)',
            }}>{em}</button>
          ))}
        </div>
      </div>

      <SectionLabel>Bike & bio</SectionLabel>
      {FIELDS.filter(f => !f.safety && !['instagram', 'phone'].includes(f.key)).map(f => <FieldInput key={f.key} f={f} draft={draft} setDraft={setDraft} />)}

      <SectionLabel>🆘 Safety (visible to the crew)</SectionLabel>
      {FIELDS.filter(f => f.safety).map(f => <FieldInput key={f.key} f={f} draft={draft} setDraft={setDraft} />)}

      <SectionLabel>Socials</SectionLabel>
      {FIELDS.filter(f => ['instagram', 'phone'].includes(f.key)).map(f => <FieldInput key={f.key} f={f} draft={draft} setDraft={setDraft} />)}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button onClick={() => setEditing(false)} style={{
          flex: 1, padding: 11, borderRadius: 10, background: 'var(--surface)',
          border: '1px solid var(--border)', fontSize: 14,
        }}>Cancel</button>
        <button onClick={commit} disabled={busy} style={{
          flex: 2, padding: 11, borderRadius: 10, background: 'var(--accent)',
          color: '#0a0a0a', fontWeight: 700, fontSize: 14, opacity: busy ? 0.6 : 1,
        }}>{busy ? 'Saving…' : 'Save profile'}</button>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 }}>{children}</div>
}

function FieldInput({ f, draft, setDraft }) {
  const common = {
    className: 'field',
    placeholder: `${f.label} — ${f.placeholder}`,
    value: draft[f.key] || '',
    onChange: e => setDraft(d => ({ ...d, [f.key]: e.target.value })),
  }
  return f.area
    ? <textarea {...common} rows={3} style={{ resize: 'vertical' }} />
    : <input {...common} type={f.tel ? 'tel' : 'text'} />
}

function Details({ me }) {
  const rows = [
    ['🩸 Blood type', me.blood],
    ['⚕️ Allergies / meds', me.allergies],
    ['🆘 Emergency', [me.emergencyName, me.emergencyPhone].filter(Boolean).join(' · ')],
    ['📸 Instagram', me.instagram],
    ['📱 Phone', me.phone],
  ].filter(([, v]) => v)
  if (rows.length === 0) return null
  return (
    <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
          <span style={{ color: 'var(--text-muted)', width: 130, flexShrink: 0 }}>{label}</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  )
}

function RiderCard({ r }) {
  const [open, setOpen] = useState(false)
  const d = r.data || {}
  return (
    <div className="card" style={{ padding: 12 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left' }}>
        <Avatar photo={r.photo} emoji={r.emoji} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {r.name} {r.role === 'admin' && <span style={{ fontSize: 10, color: 'var(--gold)' }}>★ ADMIN</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {d.bike ? `🏍️ ${d.bike}` : 'No bike set'}{d.city ? ` · ${d.city}` : ''}
          </div>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          {d.bio && <div style={{ fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>{d.bio}</div>}
          <Details me={d} />
          {!d.bio && !d.blood && !d.instagram && !d.phone && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>This rider hasn't filled in their details yet.</div>
          )}
        </div>
      )}
    </div>
  )
}
