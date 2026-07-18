import { itinerary, dayCountries, expenseCategories } from '../data/trip.js'
import { useCollection } from '../lib/useCollection.js'
import { useRoster, useTripSettings } from '../lib/useRoster.js'
import { useRider } from '../lib/RiderContext.jsx'
import { effectiveTrip, effectiveFx } from '../lib/tripConfig.js'
import tripLogo from '../assets/trip-logo.png'

function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// A print-ready travel book assembled from the trip's data. Uses a light
// theme so it looks like a real book and prints cleanly (Save as PDF).
export default function TripBook({ onClose }) {
  const { remote } = useRider()
  const settings = useTripSettings(remote)
  const T = effectiveTrip(settings)
  const fx = effectiveFx(settings)
  const roster = useRoster(remote)
  const journal = useCollection('journal', { enabled: remote })
  const photos = useCollection('photos', { enabled: remote })
  const expenses = useCollection('expenses', { enabled: remote })

  const rideDays = itinerary.filter(d => d.type === 'ride')
  const totalKm = rideDays.reduce((s, d) => s + (d.km || 0), 0)
  const dayHotel = (d) => settings?.dayHotels?.[d.day] || d.hotel
  const dayJournal = (day) => journal.items.filter(e => e.day === day).sort((a, b) => (a.ts || a.id) - (b.ts || b.id))
  const dayPhotos = (day) => photos.items.filter(p => p.day === day).map(p => p.url)

  // Expense totals in SAR then EUR
  const totalSAR = expenses.items.reduce((s, e) => s + e.amount * (fx[e.currency] ?? 1), 0)
  const byCat = {}
  expenses.items.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount * (fx[e.currency] ?? 1) })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#e9e9ea', overflowY: 'auto' }}>
      <style>{`
        @media print {
          .book-bar { display: none !important; }
          .book-page { box-shadow: none !important; margin: 0 !important; }
          .page-break { break-before: page; }
        }
        .book-page { background: #fff; color: #1a1a1a; max-width: 720px; margin: 0 auto 16px;
          padding: 40px 44px; box-shadow: 0 2px 14px rgba(0,0,0,0.15); }
        .book-page h2 { font-size: 22px; margin-bottom: 12px; color: #b8860b; }
        .book-page h3 { font-size: 17px; margin: 0 0 4px; }
        .book-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-top: 10px; }
        .book-photos img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 4px; }
      `}</style>

      {/* Toolbar (hidden in print) */}
      <div className="book-bar" style={{
        position: 'sticky', top: 0, zIndex: 2, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '12px 16px', background: '#111', color: '#fff',
        paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
      }}>
        <button onClick={onClose} style={{ fontSize: 14, color: '#ccc' }}>Close</button>
        <span style={{ fontWeight: 700, fontSize: 14 }}>📖 Trip Book</span>
        <button onClick={() => window.print()} style={{
          fontSize: 13, fontWeight: 700, color: '#0a0a0a', background: '#F2B21E',
          borderRadius: 20, padding: '7px 14px',
        }}>Save as PDF</button>
      </div>

      <div style={{ padding: '16px 0 40px' }}>
        {/* Cover */}
        <div className="book-page" style={{ textAlign: 'center', paddingTop: 60, paddingBottom: 60 }}>
          <img src={tripLogo} alt="" style={{ width: 260, maxWidth: '75%' }} />
          <h1 style={{ fontSize: 30, margin: '18px 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>{T.name}</h1>
          <div style={{ fontSize: 18, color: '#b8860b', fontWeight: 700 }}>{T.subName}</div>
          <div style={{ fontSize: 14, color: '#666', marginTop: 8 }}>{T.tagline}</div>
          <div style={{ fontSize: 15, marginTop: 18, fontWeight: 600 }}>
            {fmtDate(T.startDate)} — {fmtDate(T.endDate)}
          </div>
        </div>

        {/* Overview */}
        <div className="book-page page-break">
          <h2>The Ride</h2>
          <div style={{ display: 'flex', gap: 20, marginBottom: 16, flexWrap: 'wrap' }}>
            <Stat n={itinerary.length} l="days" />
            <Stat n={`~${totalKm.toLocaleString()}`} l="km" />
            <Stat n={rideDays.length} l="ride days" />
            <Stat n={remote && roster.length ? roster.length : T.group.size} l="riders" />
          </div>
          <h3>Objectives</h3>
          <ul style={{ margin: '4px 0 16px 18px', fontSize: 14, lineHeight: 1.7 }}>
            {T.objectives.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
          <h3>Flights</h3>
          <p style={{ fontSize: 14, margin: '4px 0 4px' }}>{T.flights.outbound.flight} · {T.flights.outbound.route} · {T.flights.outbound.date}</p>
          <p style={{ fontSize: 14, margin: '0 0 16px' }}>{T.flights.inbound.flight} · {T.flights.inbound.route} · {T.flights.inbound.date}</p>
          <h3>The bike</h3>
          <p style={{ fontSize: 14, margin: '4px 0' }}>{T.rental.bikes}</p>
          <h3 style={{ marginTop: 12 }}>Base hotel</h3>
          <p style={{ fontSize: 14, margin: '4px 0' }}>{T.baseHotel.name}</p>
        </div>

        {/* Per-day pages */}
        {itinerary.map(d => {
          const entries = dayJournal(d.day)
          const pics = dayPhotos(d.day)
          return (
            <div key={d.day} className="book-page page-break">
              <div style={{ fontSize: 12, color: '#b8860b', fontWeight: 700, letterSpacing: 1 }}>
                {d.type === 'ride' ? `RIDE DAY ${d.rideDay}` : `DAY ${d.day}`} · {(dayCountries[d.day] || []).join(' ')}
              </div>
              <h2 style={{ marginTop: 2 }}>{d.title}</h2>
              <div style={{ fontSize: 13, color: '#666' }}>
                {fmtDate(d.date)}{d.type === 'ride' ? ` · ${d.km} km · ${d.rideTime}` : ''}
              </div>

              {d.type === 'ride' && (
                <p style={{ fontSize: 14, margin: '12px 0 6px' }}><strong>Route:</strong> {d.route.join(' → ')}</p>
              )}
              <ul style={{ margin: '6px 0 6px 18px', fontSize: 14, lineHeight: 1.6 }}>
                {d.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
              <p style={{ fontSize: 13, color: '#444', margin: '4px 0' }}>🛏️ {dayHotel(d)}</p>

              {entries.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <h3>Journal</h3>
                  {entries.map(e => (
                    <p key={e.id} style={{ fontSize: 14, lineHeight: 1.6, margin: '6px 0' }}>
                      <strong style={{ color: '#b8860b' }}>{e.by}:</strong> {e.text}
                    </p>
                  ))}
                </div>
              )}

              {pics.length > 0 && (
                <div className="book-photos">
                  {pics.map((src, i) => <img key={i} src={src} alt="" />)}
                </div>
              )}
            </div>
          )
        })}

        {/* Crew */}
        {remote && roster.length > 0 && (
          <div className="book-page page-break">
            <h2>The Crew</h2>
            {roster.map(r => (
              <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', background: '#f0f0f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {r.photo ? <img src={r.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.emoji}
                </div>
                <div>
                  <h3>{r.name}</h3>
                  <div style={{ fontSize: 13, color: '#666' }}>
                    {[r.data?.bike, r.data?.city].filter(Boolean).join(' · ')}
                  </div>
                  {r.data?.bio && <div style={{ fontSize: 13, marginTop: 2 }}>{r.data.bio}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Expenses */}
        {remote && expenses.items.length > 0 && (
          <div className="book-page page-break">
            <h2>Trip Spending</h2>
            {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, sar]) => {
              const c = expenseCategories.find(x => x.id === cat)
              return (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  <span>{c?.emoji} {c?.label || cat}</span>
                  <span>€{(sar / fx.EUR).toFixed(0)} · SAR {sar.toFixed(0)}</span>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, marginTop: 10 }}>
              <span>Total</span>
              <span>€{(totalSAR / fx.EUR).toFixed(0)} · SAR {totalSAR.toFixed(0)}</span>
            </div>
          </div>
        )}

        {/* Back cover */}
        <div className="book-page page-break" style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ fontSize: 40 }}>🏍️</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 12 }}>Ride safe. Ride together.</div>
          <div style={{ fontSize: 14, color: '#666', marginTop: 6 }}>H.O.G. Jeddah Chapter · Europe {new Date(T.startDate).getFullYear()}</div>
        </div>
      </div>
    </div>
  )
}

function Stat({ n, l }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#b8860b' }}>{n}</div>
      <div style={{ fontSize: 12, color: '#666' }}>{l}</div>
    </div>
  )
}
