// Supabase Edge Function: send Web Push to specific riders.
// Deploy this, then set these secrets (Project Settings → Edge Functions):
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY  (from the app setup),
//   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import webpush from 'https://esm.sh/web-push@3.6.7'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
webpush.setVapidDetails('mailto:crew@jeddahchapter.example', VAPID_PUBLIC, VAPID_PRIVATE)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { riderIds, title, body, url } = await req.json()
    if (!Array.isArray(riderIds) || riderIds.length === 0) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...cors, 'Content-Type': 'application/json' } })
    }
    const { data: subs } = await supabase
      .from('push_subscriptions').select('*').in('rider_id', riderIds)
    const payload = JSON.stringify({ title: title ?? 'Jeddah Chapter', body: body ?? '', url: url ?? '/' })
    let sent = 0
    await Promise.all((subs ?? []).map(async (s) => {
      try { await webpush.sendNotification(s.subscription, payload); sent++ }
      catch (e) {
        // Clean up dead subscriptions
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
        }
      }
    }))
    return new Response(JSON.stringify({ sent }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
