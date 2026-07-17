import { supabase } from './supabase.js'

// Public VAPID key (safe to ship). The matching private key lives only in the
// Supabase edge function secret.
const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY
  || 'BL58dcnjGqnO_ALmrfkF-Atc-I0rYEoYILkIIDhHg6h_hI-HfUAiuXgSQWH8jDUR5w9lfDJ0YPqntdE2Gim0z-g'

function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

export function pushSupported() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator &&
    'PushManager' in window && 'Notification' in window
}

export async function pushStatus() {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return sub ? 'on' : 'off'
  } catch { return 'off' }
}

export async function enablePush(uid, name) {
  if (!pushSupported()) throw new Error('unsupported')
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') throw new Error('denied')
  const reg = await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
    })
  }
  await supabase.from('push_subscriptions').upsert({
    endpoint: sub.endpoint,
    rider_id: uid,
    rider_name: name,
    subscription: sub.toJSON(),
  }, { onConflict: 'endpoint' })
  return 'on'
}

export async function disablePush() {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      await sub.unsubscribe()
    }
  } catch { /* ignore */ }
  return 'off'
}

// Best-effort push to specific riders via the edge function. Never throws.
export async function notifyRiders(riderIds, { title, body, url } = {}) {
  const ids = [...new Set((riderIds || []).filter(Boolean))]
  if (ids.length === 0) return
  try {
    await supabase.functions.invoke('notify', { body: { riderIds: ids, title, body, url } })
  } catch { /* push is best-effort */ }
}
