import { useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'

// Admin-only editor for the shared trip facts. Saves into the admin's
// profile (data.tripSettings) so every rider sees the changes live.
export default function TripSettingsEditor({ current, onClose }) {
  const { updateProfile } = useAuth()
  const [f, setF] = useState(() => ({
    name: current.name || '',
    subName: current.subName || '',
    tagline: current.tagline || '',
    startDate: current.startDate || '',
    endDate: current.endDate || '',
    out: { ...current.flights.outbound },
    in: { ...current.flights.inbound },
    hotelName: current.baseHotel.name || '',
    hotelNote: current.baseHotel.note || '',
    rental: { ...current.rental },
    objectives: (current.objectives || []).join('\n'),
    fxEUR: current.fx?.EUR ?? 4.06,
    fxCHF: current.fx?.CHF ?? 4.35,
  }))
  const [busy, setBusy] = useState(false)

  const set = (k, v) => setF(s => ({ ...s, [k]: v }))
  const setOut = (k, v) => setF(s => ({ ...s, out: { ...s.out, [k]: v } }))
  const setIn = (k, v) => setF(s => ({ ...s, in: { ...s.in, [k]: v } }))
  const setRental = (k, v) => setF(s => ({ ...s, rental: { ...s.rental, [k]: v } }))

  const save = async () => {
    setBusy(true)
    const tripSettings = {
      name: f.name, subName: f.subName, tagline: f.tagline,
      startDate: f.startDate, endDate: f.endDate,
      flights: { outbound: f.out, inbound: f.in },
      baseHotel: { name: f.hotelName, note: f.hotelNote },
      rental: f.rental,
      objectives: f.objectives.split('\n').map(s => s.trim()).filter(Boolean),
      fx: { EUR: parseFloat(f.fxEUR) || 4.06, CHF: parseFloat(f.fxCHF) || 4.35, SAR: 1 },
    }
    await updateProfile({ tripSettings })
    setBusy(false)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <button onClick={onClose} style={{ fontSize: 14, color: 'var(--text-muted)' }}>Cancel</button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Edit trip details</span>
        <button onClick={save} disabled={busy} style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
          {busy ? '…' : 'Save'}
        </button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <L>Trip</L>
        <I ph="Chapter name" v={f.name} on={v => set('name', v)} />
        <I ph="Subtitle (e.g. Europe Ride 2026)" v={f.subName} on={v => set('subName', v)} />
        <I ph="Tagline" v={f.tagline} on={v => set('tagline', v)} />
        <Two>
          <I ph="Start date" type="date" v={f.startDate} on={v => set('startDate', v)} />
          <I ph="End date" type="date" v={f.endDate} on={v => set('endDate', v)} />
        </Two>

        <L>✈️ Outbound flight</L>
        <Two>
          <I ph="Airline" v={f.out.airline} on={v => setOut('airline', v)} />
          <I ph="Flight no." v={f.out.flight} on={v => setOut('flight', v)} />
        </Two>
        <I ph="Route (JED → MUC)" v={f.out.route} on={v => setOut('route', v)} />
        <Two>
          <I ph="Date" v={f.out.date} on={v => setOut('date', v)} />
          <I ph="Class" v={f.out.clazz} on={v => setOut('clazz', v)} />
        </Two>
        <I ph="Detail (arrival etc.)" v={f.out.detail} on={v => setOut('detail', v)} />

        <L>🏁 Return flight</L>
        <Two>
          <I ph="Airline" v={f.in.airline} on={v => setIn('airline', v)} />
          <I ph="Flight no." v={f.in.flight} on={v => setIn('flight', v)} />
        </Two>
        <I ph="Route (MUC → JED)" v={f.in.route} on={v => setIn('route', v)} />
        <Two>
          <I ph="Date" v={f.in.date} on={v => setIn('date', v)} />
          <I ph="Class" v={f.in.clazz} on={v => setIn('clazz', v)} />
        </Two>
        <I ph="Detail" v={f.in.detail} on={v => setIn('detail', v)} />

        <L>🏨 Base hotel</L>
        <I ph="Hotel name" v={f.hotelName} on={v => set('hotelName', v)} />
        <I ph="Note" v={f.hotelNote} on={v => set('hotelNote', v)} />

        <L>🏍️ Bike rental</L>
        <I ph="Bike(s)" v={f.rental.bikes} on={v => setRental('bikes', v)} />
        <I ph="Rental company" v={f.rental.company} on={v => setRental('company', v)} />
        <I ph="Pickup" v={f.rental.pickup} on={v => setRental('pickup', v)} />
        <I ph="Drop-off" v={f.rental.dropoff} on={v => setRental('dropoff', v)} />
        <Two>
          <I ph="Booking ref" v={f.rental.bookingRef} on={v => setRental('bookingRef', v)} />
          <I ph="Phone" v={f.rental.phone} on={v => setRental('phone', v)} />
        </Two>
        <I ph="Notes" v={f.rental.notes} on={v => setRental('notes', v)} />

        <L>🎯 Objectives (one per line)</L>
        <textarea className="field" rows={6} style={{ resize: 'vertical' }}
          value={f.objectives} onChange={e => set('objectives', e.target.value)} />

        <L>💱 Exchange rates (SAR per unit)</L>
        <Two>
          <I ph="€1 = SAR" type="number" v={f.fxEUR} on={v => set('fxEUR', v)} />
          <I ph="CHF 1 = SAR" type="number" v={f.fxCHF} on={v => set('fxCHF', v)} />
        </Two>

        <div style={{ height: 20 }} />
      </div>
    </div>
  )
}

const L = ({ children }) => (
  <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 10 }}>{children}</div>
)
const I = ({ ph, v, on, type = 'text' }) => (
  <input className="field" placeholder={ph} value={v || ''} type={type} onChange={e => on(e.target.value)} />
)
const Two = ({ children }) => (
  <div style={{ display: 'flex', gap: 8 }}>{children}</div>
)
