import { toast } from 'sonner'
import { safeFetcherWithAuth } from './utils'

export const handleRequestPermissionAndSubscribe = async (
  isSubscribed: boolean,
  setIsSubscribed: (value: boolean) => void,
  skipDuplicateCheck = false // Settings에서 호출할 때 true 전달
) => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    window.dispatchEvent(new CustomEvent('push:unsupported'))
    return
  }

  // Settings에서 호출할 때는 중복 실행 방지를 우회
  if (!skipDuplicateCheck) {
    const deviceKey = `notification_unsupported_${navigator.userAgent}_${screen.width}x${screen.height}`
    if (localStorage.getItem(deviceKey)) {
      return
    }
    localStorage.setItem(deviceKey, 'true')
  }

  const currentPermission = Notification.permission

  console.log('Current Notification Permission:', currentPermission)
  if (currentPermission === 'granted' && !isSubscribed) {
    await subscribeToPush(setIsSubscribed)
    return
  }

  if (currentPermission === 'denied') {
    window.dispatchEvent(new CustomEvent('push:denied'))
    return
  }

  if (currentPermission === 'default') {
    const newPermission = await Notification.requestPermission()
    if (newPermission === 'granted') {
      await subscribeToPush(setIsSubscribed)
    } else if (newPermission === 'denied') {
      window.dispatchEvent(new CustomEvent('push:denied'))
    }
  }
}

const subscribeToPush = async (setIsSubscribed: (value: boolean) => void) => {
  try {
    interface VapidKeyResponse {
      publicKey: string
    }

    const response: VapidKeyResponse = await safeFetcherWithAuth
      .get('notification/vapid')
      .json()

    const { publicKey } = response

    if (!publicKey) {
      throw new Error('Could not retrieve VAPID public key from the server.')
    }
    console.log('1. publicKey obtained:', `${publicKey.substring(0, 20)}...`)

    console.log('2. Getting service worker registration...')
    const registration = await navigator.serviceWorker.ready
    console.log('3. Service worker ready:', registration)

    console.log('4. Subscribing to push...')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey
    })
    console.log(
      '5. Subscription successful:',
      `${subscription.endpoint.substring(0, 50)}...`
    )

    console.log('6. Sending to server...')
    await safeFetcherWithAuth.post('notification/push-subscription', {
      json: { ...subscription.toJSON(), userAgent: navigator.userAgent }
    })

    console.log('7. Server response successful')
    setIsSubscribed(true)
    toast.success('Push notifications enabled successfully!')
  } catch (error) {
    console.log('ERROR occurred:', error)
    if (error instanceof Error && error.message.includes('already exists')) {
      setIsSubscribed(true)
    } else {
      console.error(
        'An error occurred during the push subscription process:',
        error
      )
      toast.error('Failed to enable push notifications. Please try again.')
    }
  }
}
