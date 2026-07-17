import { precacheAndRoute } from 'workbox-precaching'

// Precache the built app shell (injected at build time).
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// Show a notification when a push arrives.
self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch { data = {} }
  const title = data.title || 'Jeddah Chapter'
  const options = {
    body: data.body || '',
    icon: data.icon || 'tour-icon-192.png',
    badge: 'tour-icon-192.png',
    data: { url: data.url || '/' },
    tag: data.tag,
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Focus (or open) the app when a notification is tapped.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if ('focus' in c) return c.focus() }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })
  )
})
