import { useState } from 'react'
import { itinerary, dayCountries } from '../data/trip.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { useCollection } from '../lib/useCollection.js'
import { useTripSettings } from '../lib/useRoster.js'
import { useRider } from '../lib/RiderContext.jsx'
import { useAuth } from '../lib/AuthContext.jsx'
import PhotoStrip from '../components/PhotoStrip.jsx'
import DayWeather from '../components/DayWeather.jsx'
import DayJournal from '../components/DayJournal.jsx'
import Album from '../components/Album.jsx'

// Directions link through every stop of the day, in order.
function mapsLink(route) {
  const stops = route.map(encodeURIComponent)
  const destination = stops[stops.length - 1]
  const origin = stops[0]
  const waypoints = stops.slice(1, -1).join('%7C')
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`
    + (waypoints ? `&waypoints=${waypoints}` : '')
    + '&travelmode=driving'
}

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function isToday(iso) {
  return iso === new Date().toISOString().slice(0, 10)
}

export default function Route() {
  const { name, uid, remote, isAdmin } = useRider()
  const { updateProfile } = useAuth()
  const settings = useTripSettings(remote)
  const [localCompleted, setLocalCompleted] = useLocalStorage(`euroride.${name}.completed.v1`, [])
  const shared = useCollection('completions', { enabled: remote })
  const [showAlbum, setShowAlbum] = useState(false)

  const hotelOf = (d) => settings?.dayHotels?.[d.day] || d.hotel
  const saveHotel = async (day, value) => {
    await updateProfile({
      tripSettings: {
        ...(settings || {}),
        dayHotels: { ...(settings?.dayHotels || {}), [day]: value },
      },
    })
  }
  const [open, setOpen] = useState(() => {
    const today = itinerary.find(d => isToday(d.date))
    return today ? today.day : itinerary[0].day
  })

  // My completed day numbers (either source)
  const myRows = remote ? shared.items.filter(c => c.created_by === uid) : []
  const myDone = remote ? myRows.map(c => c.day) : localCompleted

  const rideDays = itinerary.filter(d => d.type === 'ride')
  const totalKm = rideDays.reduce((s, d) => s + (d.km || 0), 0)
  const doneKm = rideDays.filter(d => myDone.includes(d.day)).reduce((s, d) => s + (d.km || 0), 0)
  const pct = totalKm ? Math.round((doneKm / totalKm) * 100) : 0

  const toggleDone = (d) => {
    if (remote) {
      const row = myRows.find(c => c.day === d.day)
      if (row) shared.remove(row.id)
      else shared.upsert({ id: Date.now(), day: d.day, km: d.km, by: name })
    } else {
      setLocalCompleted(c => c.includes(d.day) ? c.filter(x => x !== d.day) : [...c, d.day])
    }
  }

  // Who else finished a day (shared mode)
  const othersDone = (day) => remote
    ? shared.items.filter(c => c.day === day && c.created_by !== uid).map(c => c.by || 'rider')
    : []

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {showAlbum && <Album onClose={() => setShowAlbum(false)} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 20 }}>🗺️ Itinerary</h1>
        <button onClick={() => setShowAlbum(true)} style={{
          background: 'var(--surface)', border: '1px solid var(--accent)', color: 'var(--accent)',
          fontWeight: 700, fontSize: 13, borderRadius: 20, padding: '6px 12px',
        }}>📸 Trip album</button>
      </div>

      {/* Ride progress */}
      <div className="card" style={{ padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <span>🏍️ Ridden</span>
          <span style={{ fontWeight: 800, color: pct === 100 ? 'var(--green)' : 'var(--accent)' }}>
            {doneKm.toLocaleString()} / {totalKm.toLocaleString()} km
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--surface)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: pct === 100 ? 'var(--green)' : 'var(--accent)',
            transition: 'width 0.4s',
          }} />
        </div>
        {pct === 100 && (
          <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 8, textAlign: 'center', fontWeight: 700 }}>
            Tour complete — every kilometre ridden 🤘
          </div>
        )}
      </div>

      {itinerary.map(d => {
        const expanded = open === d.day
        const today = isToday(d.date)
        const isRide = d.type === 'ride'
        const done = isRide && myDone.includes(d.day)
        const others = expanded && isRide ? othersDone(d.day) : []
        return (
          <div key={d.day} className="card" style={{
            padding: 0, overflow: 'hidden',
            borderColor: done ? 'var(--green)' : today ? 'var(--green)' : expanded ? 'var(--accent)' : 'var(--border)',
            opacity: done && !expanded ? 0.75 : 1,
          }}>
            <button
              onClick={() => setOpen(expanded ? null : d.day)}
              style={{ width: '100%', textAlign: 'left', padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: done ? 'var(--green)' : today ? 'var(--green)' : isRide ? 'var(--accent)' : 'var(--surface)',
                border: isRide || today || done ? 'none' : '1px solid var(--border)',
                color: '#0a0a0a', fontWeight: 800, fontSize: isRide ? 15 : 17,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{done ? '✓' : isRide ? `R${d.rideDay}` : d.tag}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {d.title} {today && <span style={{ color: 'var(--green)', fontSize: 11 }}>• TODAY</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{fmtDate(d.date)}{isRide ? ` · ${d.km} km · ${d.rideTime}` : ''}</span>
                  {dayCountries[d.day] && (
                    <span style={{ fontSize: 13 }}>{dayCountries[d.day].join(' ')}</span>
                  )}
                </div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
            </button>

            {expanded && (
              <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Route stops */}
                {isRide && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', fontSize: 13 }}>
                    {d.route.map((stop, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {i > 0 && <span style={{ color: 'var(--accent)' }}>→</span>}
                        <span style={{
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          borderRadius: 8, padding: '3px 8px',
                        }}>{stop}</span>
                      </span>
                    ))}
                  </div>
                )}

                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {d.highlights.map((h, i) => (
                    <li key={i} style={{ fontSize: 13 }}>⭐ {h}</li>
                  ))}
                </ul>

                <DayHotel value={hotelOf(d)} canEdit={remote && isAdmin} onSave={(v) => saveHotel(d.day, v)} />

                <DayWeather day={d.day} date={d.date} />

                {d.notes && (
                  <div style={{
                    fontSize: 12, color: 'var(--gold)', background: 'rgba(255,201,60,0.08)',
                    border: '1px solid rgba(255,201,60,0.25)', borderRadius: 8, padding: '8px 10px',
                  }}>💡 {d.notes}</div>
                )}

                {/* Photos of the day — shared with the group when signed in */}
                <PhotoStrip day={d.day} />

                {/* Daily journal — the trip's travel story */}
                <DayJournal day={d.day} />

                {others.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    ✓ Completed by {others.join(', ')}
                  </div>
                )}

                {isRide && (
                  <a
                    href={mapsLink(d.route)}
                    target="_blank" rel="noreferrer"
                    style={{
                      display: 'block', textAlign: 'center', background: 'var(--accent)',
                      color: '#0a0a0a', fontWeight: 700, fontSize: 14,
                      borderRadius: 10, padding: '10px 0',
                    }}
                  >
                    Open route in Google Maps
                  </a>
                )}

                {isRide && (
                  <button
                    onClick={() => toggleDone(d)}
                    style={{
                      textAlign: 'center', fontWeight: 700, fontSize: 14,
                      borderRadius: 10, padding: '10px 0',
                      background: done ? 'var(--surface)' : 'var(--green)',
                      border: done ? '1px solid var(--border)' : 'none',
                      color: done ? 'var(--text-muted)' : '#0a0a0a',
                    }}
                  >
                    {done ? `Completed ✓ (+${d.km} km) — tap to undo` : `✓ Mark day complete (+${d.km} km)`}
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Hotel line for a day. Admins can tap ✎ to edit it for the whole group.
function DayHotel({ value, canEdit, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')
  const [busy, setBusy] = useState(false)

  const start = () => { setDraft(value || ''); setEditing(true) }
  const commit = async () => { setBusy(true); await onSave(draft.trim()); setBusy(false); setEditing(false) }

  if (editing) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13 }}>🛏️</span>
        <input autoFocus className="field" style={{ flex: 1, padding: '7px 10px', fontSize: 13 }}
          placeholder="Hotel for this night"
          value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && commit()} />
        <button onClick={() => setEditing(false)} style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cancel</button>
        <button onClick={commit} disabled={busy} style={{
          fontSize: 13, fontWeight: 700, color: '#0a0a0a', background: 'var(--accent)',
          borderRadius: 8, padding: '6px 12px',
        }}>{busy ? '…' : 'Save'}</button>
      </div>
    )
  }

  return (
    <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
      🛏️ <span style={{ color: 'var(--text-muted)', flex: 1 }}>{value}</span>
      {canEdit && (
        <button onClick={start} style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>✎ Edit</button>
      )}
    </div>
  )
}
