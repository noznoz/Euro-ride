import { useState } from 'react'
import { trip, itinerary } from '../data/trip.js'
import { useLocalStorage } from '../lib/useLocalStorage.js'
import { useCollection } from '../lib/useCollection.js'
import { useRoster, useTripSettings } from '../lib/useRoster.js'
import { useRider } from '../lib/RiderContext.jsx'
import { useAuth } from '../lib/AuthContext.jsx'
import { effectiveTrip } from '../lib/tripConfig.js'
import TripSettingsEditor from '../components/TripSettingsEditor.jsx'
import tripLogo from '../assets/trip-logo.png'
import chapterLogo from '../assets/chapter-logo.png'

function daysUntil(iso) {
  const ms = new Date(iso + 'T00:00:00') - new Date()
  return Math.ceil(ms / 86400000)
}

function fmtRange(a, b) {
  const opts = { day: 'numeric', month: 'short' }
  const from = new Date(a + 'T00:00:00').toLocaleDateString('en-GB', opts)
  const to = new Date(b + 'T00:00:00').toLocaleDateString('en-GB', { ...opts, year: 'numeric' })
  return `${from} – ${to}`
}

export default function Trip() {
  const { name, uid, remote } = useRider()
  const { isAdmin } = useAuth()
  const [localCompleted] = useLocalStorage(`euroride.${name}.completed.v1`, [])
  const sharedCompletions = useCollection('completions', { enabled: remote })
  const roster = useRoster(remote)
  const settings = useTripSettings(remote)
  const [editing, setEditing] = useState(false)

  const T = effectiveTrip(settings)

  const myDone = remote
    ? sharedCompletions.items.filter(c => c.created_by === uid).map(c => c.day)
    : localCompleted

  const rideDays = itinerary.filter(d => d.type === 'ride')
  const totalKm = rideDays.reduce((s, d) => s + (d.km || 0), 0)
  const doneKm = rideDays.filter(d => myDone.includes(d.day)).reduce((s, d) => s + (d.km || 0), 0)
  const ridePct = totalKm ? Math.round((doneKm / totalKm) * 100) : 0
  const countdown = daysUntil(T.startDate)
  const tripOver = daysUntil(T.endDate) < 0
  const onTrip = countdown <= 0 && !tripOver

  const riders = remote && roster.length > 0 ? roster : trip.riders
  const stats = [
    { value: itinerary.length, label: 'days' },
    { value: `~${totalKm.toLocaleString()}`, label: 'km' },
    { value: rideDays.length, label: 'ride days' },
    { value: remote && roster.length > 0 ? roster.length : T.group.size.replace(' riders', ''), label: 'riders' },
  ]

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {editing && <TripSettingsEditor current={T} onClose={() => setEditing(false)} />}

      {/* Hero */}
      <div style={{
        background: 'radial-gradient(circle at 50% 30%, #242424 0%, #0d0d0d 70%)',
        border: '1px solid #3a2e10',
        borderRadius: 18,
        padding: '20px 18px 18px',
        textAlign: 'center',
      }}>
        <img src={tripLogo} alt="H.O.G. Jeddah Chapter — Europe Tour Sep 2026"
          style={{ width: 210, maxWidth: '80%', filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.8))' }} />
        <h1 style={{ fontSize: 22, marginTop: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
          {T.subName}
        </h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{T.tagline}</div>
        <div style={{ color: 'var(--accent)', fontWeight: 700, marginTop: 10, fontSize: 15 }}>
          {fmtRange(T.startDate, T.endDate)}
        </div>
        <div style={{ marginTop: 10, fontSize: 15 }}>
          {onTrip && <span style={{ color: 'var(--green)', fontWeight: 700 }}>🟢 ON THE ROAD — day {Math.min(itinerary.length, 1 - countdown)} of {itinerary.length}</span>}
          {!onTrip && !tripOver && (
            <span><strong style={{ fontSize: 24, color: 'var(--accent)' }}>{countdown}</strong> days to go</span>
          )}
          {tripOver && <span style={{ color: 'var(--text-muted)' }}>Trip complete — what a ride 🤘</span>}
        </div>

        {/* Ride progress — fed by the "Mark day complete" buttons on the Route tab */}
        <div style={{ marginTop: 14, textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-muted)' }}>Ridden</span>
            <span style={{ fontWeight: 800, color: ridePct === 100 ? 'var(--green)' : 'var(--accent)' }}>
              {doneKm.toLocaleString()} / {totalKm.toLocaleString()} km
            </span>
          </div>
          <div style={{ height: 7, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              width: `${ridePct}%`, height: '100%',
              background: ridePct === 100 ? 'var(--green)' : 'var(--accent)',
              transition: 'width 0.4s',
            }} />
          </div>
        </div>
      </div>

      {isAdmin && (
        <button onClick={() => setEditing(true)} style={{
          padding: 11, borderRadius: 12, background: 'var(--surface)',
          border: '1px solid var(--accent)', color: 'var(--accent)', fontWeight: 700, fontSize: 14,
        }}>✏️ Edit trip details</button>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '12px 4px' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Flights */}
      <div className="card">
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>✈️ Flights — {T.flights.outbound.airline}, {T.flights.outbound.clazz}</h2>
        <FlightRow f={T.flights.outbound} />
        <div style={{ borderTop: '1px solid var(--border)', margin: '10px 0' }} />
        <FlightRow f={T.flights.inbound} />
      </div>

      {/* Bike */}
      <div className="card" style={{ borderColor: '#3a2e10' }}>
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>🏍️ The bike</h2>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--accent)' }}>{T.rental.bikes}</div>
        <Row label="Rental" value={T.rental.company} />
        <Row label="Pickup" value={T.rental.pickup} />
        <Row label="Drop-off" value={T.rental.dropoff} />
        <Row label="Booking" value={T.rental.bookingRef} />
        <Row label="Phone" value={T.rental.phone} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{T.rental.notes}</div>
      </div>

      {/* Base hotel */}
      <div className="card">
        <h2 style={{ fontSize: 14, marginBottom: 6 }}>🏨 Base hotel</h2>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{T.baseHotel.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{T.baseHotel.note}</div>
      </div>

      <Reservations />

      {/* Crew — live roster when signed in */}
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <img src={chapterLogo} alt="H.O.G. Jeddah Chapter — Saudi Arabia" style={{ width: 190, maxWidth: '75%' }} />
        </div>
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>
          👥 The crew — {remote && roster.length > 0 ? `${roster.length} signed up` : T.group.size}
        </h2>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {riders.map(r => (
            <div key={r.id || r.name} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--surface)', border: '2px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, overflow: 'hidden',
              }}>{r.photo ? <img src={r.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.emoji}</div>
              <div style={{ fontSize: 11, marginTop: 4, maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>{T.group.note}</div>
      </div>

      {/* Objectives */}
      <div className="card" style={{ borderColor: 'rgba(255,201,60,0.35)' }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>🎯 Trip objectives</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {T.objectives.map((o, i) => (
            <li key={i} style={{ fontSize: 13, display: 'flex', gap: 8 }}>
              <span style={{ color: 'var(--accent)' }}>▸</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Each rider keeps their own booking references (rooms, bike, insurance…).
function Reservations() {
  const { name, uid, remote } = useRider()
  const [localItems, setLocalItems] = useLocalStorage(`euroride.${name}.reservations.v1`, [])
  const shared = useCollection('reservations', { enabled: remote })
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ label: '', ref: '' })

  const items = remote ? shared.items.filter(i => i.created_by === uid) : localItems

  const add = () => {
    if (!draft.label.trim()) return
    const item = { ...draft, id: Date.now(), by: name }
    if (remote) shared.upsert(item)
    else setLocalItems(list => [...list, item])
    setDraft({ label: '', ref: '' })
    setAdding(false)
  }
  const remove = (id) => {
    if (remote) shared.remove(id)
    else setLocalItems(list => list.filter(i => i.id !== id))
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: 14, marginBottom: 8 }}>🎫 My reservations — {name}</h2>
      {items.length === 0 && !adding && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
          Keep your own booking references here: hotel rooms, bike rental, insurance, train tickets…
        </div>
      )}
      {items.map(i => (
        <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 13 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600 }}>{i.label}</div>
            {i.ref && <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i.ref}</div>}
          </div>
          <button onClick={() => remove(i.id)} style={{ color: 'var(--text-muted)', fontSize: 14 }}>✕</button>
        </div>
      ))}
      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <input autoFocus className="field" placeholder="What is it? (e.g. Hotel Bregenz — room)"
            value={draft.label} onChange={e => setDraft(d => ({ ...d, label: e.target.value }))} />
          <input className="field" placeholder="Reference / confirmation no. (optional)"
            value={draft.ref} onChange={e => setDraft(d => ({ ...d, ref: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && add()} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setAdding(false)} style={{
              flex: 1, padding: 9, borderRadius: 10, background: 'var(--surface)',
              border: '1px solid var(--border)', fontSize: 13,
            }}>Cancel</button>
            <button onClick={add} style={{
              flex: 2, padding: 9, borderRadius: 10, background: 'var(--accent)',
              color: '#0a0a0a', fontWeight: 700, fontSize: 13,
            }}>Save</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ color: 'var(--accent)', fontSize: 13, marginTop: 4 }}>
          + Add reservation
        </button>
      )}
    </div>
  )
}

function FlightRow({ f }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700 }}>
        <span>{f.flight}</span>
        <span style={{ color: 'var(--accent)' }}>{f.date}</span>
      </div>
      <div style={{ fontSize: 13, marginTop: 2 }}>{f.route}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{f.detail}</div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 10, fontSize: 13, padding: '4px 0' }}>
      <span style={{ color: 'var(--text-muted)', width: 72, flexShrink: 0 }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}
