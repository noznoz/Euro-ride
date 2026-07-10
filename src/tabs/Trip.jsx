import { trip, itinerary, countries } from '../data/trip.js'

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
  const totalKm = itinerary.reduce((s, d) => s + (d.km || 0), 0)
  const countdown = daysUntil(trip.startDate)
  const tripOver = daysUntil(trip.endDate) < 0
  const onTrip = countdown <= 0 && !tripOver

  const stats = [
    { value: itinerary.length, label: 'days' },
    { value: totalKm.toLocaleString(), label: 'km' },
    { value: countries.length, label: 'countries' },
    { value: trip.riders.length, label: 'riders' },
  ]

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #16305e 0%, #0d1b36 100%)',
        border: '1px solid #24407a',
        borderRadius: 18,
        padding: '22px 18px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40 }}>🏍️</div>
        <h1 style={{ fontSize: 26, marginTop: 4 }}>{trip.name}</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>{trip.tagline}</div>
        <div style={{ color: 'var(--gold)', fontWeight: 700, marginTop: 10, fontSize: 15 }}>
          {fmtRange(trip.startDate, trip.endDate)}
        </div>
        <div style={{ marginTop: 12, fontSize: 15 }}>
          {onTrip && <span style={{ color: 'var(--green)', fontWeight: 700 }}>🟢 ON THE ROAD — day {Math.min(itinerary.length, 1 - countdown)} of {itinerary.length}</span>}
          {!onTrip && !tripOver && (
            <span><strong style={{ fontSize: 24, color: 'var(--blue)' }}>{countdown}</strong> days to go</span>
          )}
          {tripOver && <span style={{ color: 'var(--text-muted)' }}>Trip complete — what a ride 🤘</span>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '12px 4px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--blue)' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Riders */}
      <div className="card">
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>The crew</h2>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {trip.riders.map(r => (
            <div key={r.name} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--surface)', border: '2px solid var(--blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{r.emoji}</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>{r.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rental */}
      <div className="card">
        <h2 style={{ fontSize: 14, marginBottom: 10 }}>🏍️ Bike rental</h2>
        <Row label="Company" value={trip.rental.company} />
        <Row label="Bikes" value={trip.rental.bikes} />
        <Row label="Pickup" value={trip.rental.pickup} />
        <Row label="Drop-off" value={trip.rental.dropoff} />
        <Row label="Booking" value={trip.rental.bookingRef} />
        <Row label="Phone" value={trip.rental.phone} />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>{trip.rental.notes}</div>
      </div>
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
