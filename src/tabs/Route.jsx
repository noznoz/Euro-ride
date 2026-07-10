import { useState } from 'react'
import { itinerary } from '../data/trip.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { useProfile } from '../lib/ProfileContext.jsx'
import PhotoStrip from '../components/PhotoStrip.jsx'

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
  const { profile } = useProfile()
  const [completed, setCompleted] = useLocalStorage(`euroride.${profile}.completed.v1`, [])
  const [open, setOpen] = useState(() => {
    const today = itinerary.find(d => isToday(d.date))
    return today ? today.day : itinerary[0].day
  })

  const rideDays = itinerary.filter(d => d.type === 'ride')
  const totalKm = rideDays.reduce((s, d) => s + (d.km || 0), 0)
  const doneKm = rideDays.filter(d => completed.includes(d.day)).reduce((s, d) => s + (d.km || 0), 0)
  const pct = totalKm ? Math.round((doneKm / totalKm) * 100) : 0

  const toggleDone = (day) => setCompleted(c =>
    c.includes(day) ? c.filter(x => x !== day) : [...c, day]
  )

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h1 style={{ fontSize: 20 }}>🗺️ Itinerary</h1>

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
        const done = isRide && completed.includes(d.day)
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
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {fmtDate(d.date)}{isRide ? ` · ${d.km} km · ${d.rideTime}` : ''}
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

                <div style={{ fontSize: 13 }}>🛏️ <span style={{ color: 'var(--text-muted)' }}>{d.hotel}</span></div>
                {d.notes && (
                  <div style={{
                    fontSize: 12, color: 'var(--gold)', background: 'rgba(255,201,60,0.08)',
                    border: '1px solid rgba(255,201,60,0.25)', borderRadius: 8, padding: '8px 10px',
                  }}>💡 {d.notes}</div>
                )}

                {/* Photos of the day */}
                <PhotoStrip storageKey={`day-${d.day}`} />

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
                    onClick={() => toggleDone(d.day)}
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
