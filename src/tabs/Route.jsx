import { useState } from 'react'
import { itinerary } from '../data/trip.js'

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
  const [open, setOpen] = useState(() => {
    const today = itinerary.find(d => isToday(d.date))
    return today ? today.day : itinerary[0].day
  })

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h1 style={{ fontSize: 20 }}>🗺️ Itinerary</h1>

      {itinerary.map(d => {
        const expanded = open === d.day
        const today = isToday(d.date)
        const isRide = d.type === 'ride'
        return (
          <div key={d.day} className="card" style={{
            padding: 0, overflow: 'hidden',
            borderColor: today ? 'var(--green)' : expanded ? 'var(--accent)' : 'var(--border)',
          }}>
            <button
              onClick={() => setOpen(expanded ? null : d.day)}
              style={{ width: '100%', textAlign: 'left', padding: 14, display: 'flex', gap: 12, alignItems: 'center' }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: today ? 'var(--green)' : isRide ? 'var(--accent)' : 'var(--surface)',
                border: isRide || today ? 'none' : '1px solid var(--border)',
                color: '#0a0a0a', fontWeight: 800, fontSize: isRide ? 15 : 17,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{isRide ? `R${d.rideDay}` : d.tag}</div>
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
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
