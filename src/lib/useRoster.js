import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

// Live list of approved riders (the chapter roster), with their full
// profile data (photo, bio, bike, safety, socials).
export function useRoster(enabled = true) {
  const [riders, setRiders] = useState([])

  useEffect(() => {
    if (!enabled) return
    let alive = true
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, role, data')
        .eq('status', 'approved')
        .order('created_at', { ascending: true })
      if (alive && data) {
        setRiders(data.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          emoji: p.data?.emoji || '🏍️',
          photo: p.data?.photo || null,
          data: p.data || {},
        })))
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

// Shared trip settings, stored inside the admin's profile so no extra table
// (or SQL migration) is needed. Everyone can read it; only the admin writes it.
export function useTripSettings(enabled = true) {
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    if (!enabled) { setSettings(null); return }
    let alive = true
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('data')
        .eq('role', 'admin')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (alive) setSettings(data?.data?.tripSettings || null)
    }
    load()
    const channel = supabase
      .channel('realtime:tripsettings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, load)
      .subscribe()
    return () => { alive = false; supabase.removeChannel(channel) }
  }, [enabled])

  return settings
}
