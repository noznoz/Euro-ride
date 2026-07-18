import { trip, countries } from '../data/trip.js'
import CrewLocation from '../components/CrewLocation.jsx'

export default function Info() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 20 }}>🛂 Riding info</h1>

      <CrewLocation />

      {/* Emergency */}
      <div className="card" style={{ borderColor: 'rgba(255,80,80,0.4)' }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>🚨 Emergency</h2>
        {trip.emergency.numbers.map(n => (
          <div key={n.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '5px 0', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>{n.label}</span>
            {/^[+\d]/.test(n.value)
              ? <a href={`tel:${n.value.replace(/\s/g, '')}`} style={{ color: 'var(--accent)', fontWeight: 700 }}>{n.value}</a>
              : <span style={{ fontWeight: 600, textAlign: 'right' }}>{n.value}</span>}
          </div>
        ))}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          Crash protocol: secure the scene → 112 → rental hotline → insurance. Photograph everything.
        </div>
      </div>

      {/* Countries */}
      {countries.map(c => (
        <div key={c.name} className="card">
          <h2 style={{ fontSize: 15, marginBottom: 8 }}>{c.flag} {c.name}</h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {c.facts.map((f, i) => (
              <li key={i} style={{ fontSize: 13, display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--accent)' }}>•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Golden rules */}
      <div className="card" style={{ borderColor: 'rgba(255,201,60,0.35)' }}>
        <h2 style={{ fontSize: 14, marginBottom: 8 }}>⭐ Golden rules</h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
          <li>⛽ Fuel up when the tank hits half — mountain stations are rare and close early.</li>
          <li>🌦️ Alpine weather flips fast: rain gear stays on top of the luggage.</li>
          <li>🧊 Passes above 2,000 m can be near-freezing at dawn, even in summer.</li>
          <li>📵 Group rule: the ride leader sets the pace; last rider carries the toolkit.</li>
          <li>🕐 Regroup at every pass summit — no one rides alone.</li>
        </ul>
      </div>
    </div>
  )
}
