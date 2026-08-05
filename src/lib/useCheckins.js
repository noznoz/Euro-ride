import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

// Roll-call check-ins. Each rider upserts their latest "I'm here" timestamp.
export function useCheckins(enabled = true) {
  const [checkins, setCheckins] = useState([])

  const refetch = useCallback(async () => {
    const { data } = await supabase.from('checkins').select('*')
    if (data) setCheckins(data)
  }, [])

  useEffect(() => {
    if (!enabled) { setCheckins([]); return }
    refetch()
    const channel = supabase
      .channel(`rt:checkins:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, () => refetch())
      .subscribe()
    const poll = setInterval(refetch, 20000)
    return () => { supabase.removeChannel(channel); clearInterval(poll) }
  }, [enabled, refetch])

  const checkIn = useCallback(async (uid, name) => {
    const ts = Date.now()
    setCheckins(prev => {
      const rest = prev.filter(c => c.rider_id !== uid)
      return [...rest, { rider_id: uid, rider_name: name, ts }]
    })
    await supabase.from('checkins').upsert(
      { rider_id: uid, rider_name: name, ts, updated_at: new Date().toISOString() },
      { onConflict: 'rider_id' })
  }, [])

  return { checkins, checkIn }
}
