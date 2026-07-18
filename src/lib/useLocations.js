import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

// Live crew locations. Each rider upserts their own latest position.
export function useLocations(enabled = true) {
  const [locations, setLocations] = useState([])
  const [sharing, setSharing] = useState(false)

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('locations').select('*').order('updated_at', { ascending: false })
    if (data) setLocations(data)
  }, [])

  useEffect(() => {
    if (!enabled) { setLocations([]); return }
    refetch()
    const channel = supabase
      .channel(`rt:locations:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'locations' }, () => refetch())
      .subscribe()
    const poll = setInterval(refetch, 20000)
    return () => { supabase.removeChannel(channel); clearInterval(poll) }
  }, [enabled, refetch])

  // Capture GPS and upsert. Resolves to the new row, rejects on error.
  const share = useCallback((uid, name, sos = false) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('no-geo')); return }
      setSharing(true)
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const row = {
          rider_id: uid, rider_name: name,
          lat: pos.coords.latitude, lon: pos.coords.longitude,
          sos, ts: Date.now(), updated_at: new Date().toISOString(),
        }
        await supabase.from('locations').upsert(row, { onConflict: 'rider_id' })
        setSharing(false)
        resolve(row)
      }, (err) => { setSharing(false); reject(err) }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 })
    })
  }, [])

  return { locations, share, sharing, refetch }
}
