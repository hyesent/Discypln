/* ============================================================
   DISCYPLN — Service Worker
   Cache-first for shell, push handler, notification click
   ============================================================ */

const CACHE_NAME = 'discypln-v2'
const urlsToCache = ['/', '/index.html']

// ===== INSTALL =====
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
  self.skipWaiting()
})

// ===== ACTIVATE — clean old caches =====
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ===== FETCH — cache-first, network fallback =====
self.addEventListener('fetch', (event) => {
  // Only handle GET requests; let the network deal with everything else
  if (event.request.method !== 'GET') return

  // Don't intercept Supabase / API calls — always go to network
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/functions/') || url.hostname.endsWith('supabase.co')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  )
})

// ===== PUSH =====
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { title: 'Discypln', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Discypln'
  const options = {
    body: data.body || '',
    tag: data.tag || 'discypln',
    renotify: true,
    data: { url: data.url || '/' },
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [80, 40, 80],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl)
        }
      })
  )
})

// ===== NOTIFICATION CLOSE (cleanup hook) =====
self.addEventListener('notificationclose', (event) => {
  // Reserved for future analytics — nothing to do yet
})
