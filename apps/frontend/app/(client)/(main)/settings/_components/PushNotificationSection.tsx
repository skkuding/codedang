'use client'

import { AlertModal } from '@/components/AlertModal'
import { Switch } from '@/components/shadcn/switch'
import {
  fetchIsSubscribed,
  handleRequestPermissionAndSubscribe
} from '@/libs/push-subscription'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function PushNotificationSection() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showDisableModal, setShowDisableModal] = useState(false)

  useEffect(() => {
    fetchIsSubscribed(setIsSubscribed)
  }, [])

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await handleRequestPermissionAndSubscribe(isSubscribed, setIsSubscribed)
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
    } catch {
      toast.error('Failed to disable push notifications.')
    }
  }

  return (
    <>
      <div className="mt-2 flex items-center justify-between">
        <label>Receive Push Notifications</label>
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
