import { useCallback, useEffect, useState } from 'react'
import { supabase } from './supabase.js'
import { notifyRiders } from './push.js'

// Direct messages involving the current rider. RLS returns only messages
// I sent or received, so a plain select is safe. Kept live via Realtime.
export function useMessages(enabled = true) {
  const [items, setItems] = useState([])

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('id', { ascending: true })
    if (!error && data) {
      setItems(data.map(r => ({ id: r.id, to_id: r.to_id, created_by: r.created_by, ...(r.data || {}) })))
    }
  }, [])

  useEffect(() => {
    if (!enabled) { setItems([]); return }
    refetch()
    const channel = supabase
      .channel(`rt:messages:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => refetch())
      .subscribe()
    const poll = setInterval(refetch, 15000)
    return () => { supabase.removeChannel(channel); clearInterval(poll) }
  }, [enabled, refetch])

  const send = useCallback(async ({ toId, toName, fromName, text }) => {
    const id = Date.now()
    const { data: auth } = await supabase.auth.getUser()
    const me = auth?.user?.id
    const row = { id, to_id: toId, data: { fromName, toName, text, ts: id } }
    setItems(prev => [...prev, { id, to_id: toId, created_by: me, fromName, toName, text, ts: id }])
    await supabase.from('messages').insert(row)
    notifyRiders([toId], { title: `Message from ${fromName}`, body: text })
  }, [])

  const remove = useCallback(async (id) => {
    setItems(prev => prev.filter(m => m.id !== id))
    await supabase.from('messages').delete().eq('id', id)
  }, [])

  return { items, send, remove, refetch }
}
