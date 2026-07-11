import { useEffect, useState } from 'react'
import { dayLocations } from '../data/trip.js'
import { getForecast, describe } from '../lib/weather.js'

// Compact forecast chip for a given itinerary day, shown in the Route card.
export default function DayWeather({ day, date }) {
  const loc = dayLocations[day]
  const [status, setStatus] = useState('loading') // loading | ok | far | err
  const [wx, setWx] = useState(null)

  useEffect(() => {
    if (!loc) { setStatus('err'); return }
    let alive = true
    getForecast(loc.lat, loc.lon, date)
      .then(w => { if (!alive) return; if (w) { setWx(w); setStatus('ok') } else setStatus('far') })
      .catch(() => alive && setStatus('err'))
    return () => { alive = false }
  }, [day, date, loc])

  if (status === 'err') return null

  const wrap = {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '8px 10px', fontSize: 13,
  }

  if (status === 'loading') {
    return <div style={{ ...wrap, color: 'var(--text-muted)' }}>🌡️ Loading weather for {loc.name}…</div>
  }
  if (status === 'far') {
    return (
      <div style={{ ...wrap, color: 'var(--text-muted)' }}>
        🗓️ {loc.name} forecast appears ~2 weeks before the trip
      </div>
    )
  }

  const { icon, label } = describe(wx.code)
  const cold = wx.tmin <= 3
  return (
    <div style={wrap}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700 }}>
          {loc.name} · {wx.tmax}° <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {wx.tmin}°</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {label}{wx.rain != null ? ` · 💧 ${wx.rain}%` : ''}{wx.wind != null ? ` · 💨 ${wx.wind} km/h` : ''}
        </div>
      </div>
      {cold && <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>🧊 heated vest</span>}
    </div>
  )
}
