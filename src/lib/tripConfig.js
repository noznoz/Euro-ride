import { trip, fx } from '../data/trip.js'

// Merge admin-entered trip settings (stored in the admin profile) over the
// built-in defaults from trip.js. The itinerary/route is intentionally NOT
// editable here — it stays as designed in trip.js.
export function effectiveTrip(settings) {
  if (!settings) return trip
  return {
    ...trip,
    ...settings,
    flights: {
      outbound: { ...trip.flights.outbound, ...(settings.flights?.outbound || {}) },
      inbound: { ...trip.flights.inbound, ...(settings.flights?.inbound || {}) },
    },
    baseHotel: { ...trip.baseHotel, ...(settings.baseHotel || {}) },
    rental: { ...trip.rental, ...(settings.rental || {}) },
    group: { ...trip.group, ...(settings.group || {}) },
    objectives: settings.objectives?.length ? settings.objectives : trip.objectives,
  }
}

export function effectiveFx(settings) {
  return settings?.fx ? { ...fx, ...settings.fx } : fx
}
