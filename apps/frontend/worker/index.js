self.addEventListener('push', (event) => {
  const data = event.data.json()
  const title = data.title || 'New Notification'
  const options = {
    body: data.body || 'Check the details.',
    icon: data.icon ?? '/logos/transparent.png',
    badge: data.badge ?? '/logos/codedang-badge.png'
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
