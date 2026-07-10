import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

// Live list of approved riders (the chapter roster), for the Trip tab.
export function useRoster(enabled = true) {
  const [riders, setRiders] = useState([])

  useEffect(() => {
    if (!enabled) return
    let alive = true
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, status, data')
        .eq('status', 'approved')
        .order('created_at', { ascending: true })
      if (alive && data) {
        setRiders(data.map(p => ({ id: p.id, name: p.name, emoji: p.data?.emoji || '🏍️' })))
      }
    }
    load()
    const channel = supabase
      .channel('realtime:roster')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe()
    return () => { alive = false; supabase.removeChannel(channel) }
  }, [enabled])

  return riders
}
