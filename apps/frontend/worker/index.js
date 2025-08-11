self.addEventListener('push', (event) => {
  const data = event.data.json()
  const title = data.title || 'New Notification'
  const options = {
    body: data.body || 'Check the details.',
    icon: '/android-chrome-192x192.png'
  }
  event.waitUntil(self.registration.showNotification(title, options))
})
