import { toast } from 'sonner'
import { safeFetcherWithAuth } from './utils'

export const fetchIsSubscribed = async (
  setIsSubscribed: (value: boolean) => void
) => {
  const data = await safeFetcherWithAuth
    .get('notification/push-subscription')
    .json()
  setIsSubscribed(Array.isArray(data) && data.length > 0)
}

export const handleRequestPermissionAndSubscribe = async (
  isSubscribed: boolean,
  setIsSubscribed: (value: boolean) => void
) => {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    window.dispatchEvent(new CustomEvent('push:unsupported'))
    return
  }

  const currentPermission = Notification.permission

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

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey
    })

    await safeFetcherWithAuth.post('notification/push-subscription', {
      json: { ...subscription.toJSON(), userAgent: navigator.userAgent }
    })

    setIsSubscribed(true)
    window.dispatchEvent(new CustomEvent('push:subscribed'))
  } catch (error) {
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
