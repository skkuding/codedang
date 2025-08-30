'use client'

import { AlertModal } from '@/components/AlertModal'
import { Switch } from '@/components/shadcn/switch'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function PushNotificationSection() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showDisableModal, setShowDisableModal] = useState(false)

  useEffect(() => {
    const fetchIsSubscribed = async () => {
      try {
        const data = await safeFetcherWithAuth
          .get('notification/push-subscription')
          .json()
        const isUserSubscribed = Array.isArray(data) && data.length > 0
        setIsSubscribed(isUserSubscribed)
      } catch (error) {
        console.error('Error fetching subscription status:', error)
        setIsSubscribed(false)
      } finally {
        setIsLoading(false)
      }
    }
    fetchIsSubscribed()
  }, [])

  const handleRequestPermissionAndSubscribe = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      toast.error(
        'Install PWA to get notifications. Instructions can be found in notice.'
      )
      return
    }

    const currentPermission = Notification.permission

    if (currentPermission === 'granted' && !isSubscribed) {
      await subscribeToPush()
      return
    }

    if (currentPermission === 'denied') {
      toast.error(
        'Notification permission has been blocked. Please allow it in your browser settings.'
      )
      return
    }

    if (currentPermission === 'default') {
      const newPermission = await Notification.requestPermission()
      if (newPermission === 'granted') {
        await subscribeToPush()
      }
    }
  }

  const subscribeToPush = async () => {
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
      toast.success('Push notifications enabled successfully!')
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

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await handleRequestPermissionAndSubscribe()
    } else {
      setShowDisableModal(true)
    }
  }

  const handleDisablePushNotifications = async () => {
    try {
      await safeFetcherWithAuth.delete('notification/push-subscription').json()
      setIsSubscribed(false)
      setShowDisableModal(false)
      toast.success('Push notifications are disabled.')
    } catch (error) {
      console.error('Failed to delete push subscription:', error)
      toast.error('Failed to disable push notifications.')
    }
  }

  if (isLoading) {
    return (
      <>
        <label className="-mb-4 mt-2 text-xs">Push Notifications</label>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600">Loading...</span>
          <Switch disabled />
        </div>
      </>
    )
  }

  return (
    <>
      <label className="-mb-4 mt-2 text-xs">Push Notifications</label>
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-600">
          Receive push notifications about assignments
        </span>
        <Switch checked={isSubscribed} onCheckedChange={handleToggle} />
      </div>

      <AlertModal
        open={showDisableModal}
        onOpenChange={setShowDisableModal}
        type="warning"
        title="Disable Push Notifications"
        description="This will disable push notifications on all your devices. Are you sure you want to continue?"
        primaryButton={{
          text: 'Disable',
          onClick: handleDisablePushNotifications,
          variant: 'default'
        }}
      />
    </>
  )
}
