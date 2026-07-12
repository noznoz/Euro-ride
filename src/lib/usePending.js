import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'

// Riders awaiting approval (admin only — RLS lets any authed user read
// profiles, but only admins can flip status).
export function usePending(enabled = true) {
  const [pending, setPending] = useState([])

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (data) setPending(data.map(p => ({ id: p.id, name: p.name, email: p.email, joinedTs: p.created_at ? new Date(p.created_at).getTime() : Date.now() })))
  }, [])

  useEffect(() => {
    if (!enabled) { setPending([]); return }
    refetch()
    const channel = supabase
      .channel(`rt:pending:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => refetch())
      .subscribe()
    const poll = setInterval(refetch, 20000)
    return () => { supabase.removeChannel(channel); clearInterval(poll) }
  }, [enabled, refetch])

  const approve = useCallback(async (id) => {
    setPending(p => p.filter(x => x.id !== id))
    await supabase.from('profiles').update({ status: 'approved' }).eq('id', id)
  }, [])

  const reject = useCallback(async (id) => {
    setPending(p => p.filter(x => x.id !== id))
    await supabase.from('profiles').update({ status: 'rejected' }).eq('id', id)
  }, [])

  return { pending, approve, reject, refetch }
}
