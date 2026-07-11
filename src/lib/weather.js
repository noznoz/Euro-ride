// Free forecast from Open-Meteo — no API key, CORS-enabled.
// Forecasts reach ~16 days ahead; beyond that we say so.

const cache = {}

export async function getForecast(lat, lon, date) {
  const key = `${lat},${lon},${date}`
  if (key in cache) return cache[key]
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}`
    + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max`
    + `&timezone=auto&start_date=${date}&end_date=${date}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('weather fetch failed')
  const j = await res.json()
  const d = j.daily
  if (!d || !d.time || d.time.length === 0 || d.temperature_2m_max[0] == null) {
    cache[key] = null
    return null
  }
  const out = {
    code: d.weather_code[0],
    tmax: Math.round(d.temperature_2m_max[0]),
    tmin: Math.round(d.temperature_2m_min[0]),
    rain: d.precipitation_probability_max?.[0] ?? null,
    wind: d.wind_speed_10m_max?.[0] != null ? Math.round(d.wind_speed_10m_max[0]) : null,
  }
  cache[key] = out
  return out
}

// WMO weather code → emoji + short label
export function describe(code) {
  if (code === 0) return { icon: '☀️', label: 'Clear' }
  if (code <= 2) return { icon: '🌤️', label: 'Mostly sunny' }
  if (code === 3) return { icon: '☁️', label: 'Cloudy' }
  if (code <= 48) return { icon: '🌫️', label: 'Fog' }
  if (code <= 57) return { icon: '🌦️', label: 'Drizzle' }
  if (code <= 67) return { icon: '🌧️', label: 'Rain' }
  if (code <= 77) return { icon: '❄️', label: 'Snow' }
  if (code <= 82) return { icon: '🌧️', label: 'Showers' }
  if (code <= 86) return { icon: '🌨️', label: 'Snow showers' }
  return { icon: '⛈️', label: 'Thunderstorm' }
}
