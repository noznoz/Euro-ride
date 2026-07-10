import { trip, itinerary } from '../data/trip.js'
import ChapterBadge from '../components/ChapterBadge.jsx'

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
  const rideDays = itinerary.filter(d => d.type === 'ride')
  const totalKm = rideDays.reduce((s, d) => s + (d.km || 0), 0)
  const countdown = daysUntil(trip.startDate)
  const tripOver = daysUntil(trip.endDate) < 0
  const onTrip = countdown <= 0 && !tripOver

  const stats = [
    { value: itinerary.length, label: 'days' },
    { value: `~${totalKm.toLocaleString()}`, label: 'km' },
    { value: rideDays.length, label: 'ride days' },
    { value: trip.group.size.replace(' riders', ''), label: 'riders' },
  ]

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(160deg, #1a1a1a 0%, #0d0d0d 100%)',
        border: '1px solid #3a2410',
        borderRadius: 18,
        padding: '20px 18px 18px',
        textAlign: 'center',
      }}>
        <ChapterBadge width={170} />
        <h1 style={{ fontSize: 22, marginTop: 10, letterSpacing: 1, textTransform: 'uppercase' }}>
          {trip.subName}
        </h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{trip.tagline}</div>
        <div style={{ color: 'var(--accent)', fontWeight: 700, marginTop: 10, fontSize: 15 }}>
          {fmtRange(trip.startDate, trip.endDate)}
        </div>
        <div style={{ marginTop: 10, fontSize: 15 }}>
          {onTrip && <span style={{ color: 'var(--green)', fontWeight: 700 }}>🟢 ON THE ROAD — day {Math.min(itinerary.length, 1 - countdown)} of {itinerary.length}</span>}
          {!onTrip && !tripOver && (
            <span><strong style={{ fontSize: 24, color: 'var(--accent)' }}>{countdown}</strong> days to go</span>
          )}
          {tripOver && <span style={{ color: 'var(--text-muted)' }}>Trip complete — what a ride 🤘</span>}
        </div>
      </div>

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
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>✈️ Flights — {trip.flights.outbound.airline}, {trip.flights.outbound.clazz}</h2>
        <FlightRow f={trip.flights.outbound} />
        <div style={{ borderTop: '1px solid var(--border)', margin: '10px 0' }} />
        <FlightRow f={trip.flights.inbound} />
      </div>

      {/* Bike */}
      <div className="card" style={{ borderColor: '#3a2410' }}>
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>🏍️ The bike</h2>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--accent)' }}>{trip.rental.bikes}</div>
        <Row label="Rental" value={trip.rental.company} />
        <Row label="Pickup" value={trip.rental.pickup} />
        <Row label="Drop-off" value={trip.rental.dropoff} />
        <Row label="Booking" value={trip.rental.bookingRef} />
        <Row label="Phone" value={trip.rental.phone} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{trip.rental.notes}</div>
      </div>

      {/* Base hotel */}
      <div className="card">
        <h2 style={{ fontSize: 14, marginBottom: 6 }}>🏨 Base hotel</h2>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{trip.baseHotel.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{trip.baseHotel.note}</div>
      </div>

      {/* Crew */}
      <div className="card">
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>👥 The crew — {trip.group.size}</h2>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {trip.riders.map(r => (
            <div key={r.name} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--surface)', border: '2px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{r.emoji}</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>{r.name}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>{trip.group.note}</div>
      </div>

      {/* Objectives */}
      <div className="card" style={{ borderColor: 'rgba(255,201,60,0.35)' }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>🎯 Trip objectives</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {trip.objectives.map((o, i) => (
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
