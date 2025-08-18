self.addEventListener('push', (event) => {
  const payload = event.data.json()
  const title = payload.title || 'New Notification'
  const options = {
    body: payload.body || 'Check the details.',
    icon: payload.icon ?? '/logos/transparent.png',
    badge: payload.badge ?? '/logos/codedang-badge.png',
    data: { url: payload.data.url || '' }
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data.url

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.navigate(urlToOpen).then((c) => c?.focus())
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})
