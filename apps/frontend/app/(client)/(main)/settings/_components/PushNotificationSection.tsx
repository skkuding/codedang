'use client'

import { AlertModal } from '@/components/AlertModal'
import { Switch } from '@/components/shadcn/switch'
import {
  fetchIsSubscribed,
  handleRequestPermissionAndSubscribe
} from '@/libs/push-subscription'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function PushNotificationSection() {
  const { t } = useTranslate()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [showDisableModal, setShowDisableModal] = useState(false)

  useEffect(() => {
    fetchIsSubscribed(setIsSubscribed)
  }, [])

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        setIsSubscribed(false)
        window.dispatchEvent(new CustomEvent('push:unsupported'))
        return
      }
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
      toast.success(t('push_notifications_disabled'))
    } catch {
      toast.error(t('failed_to_disable_push_notifications'))
    }
  }

  return (
    <>
      <div className="mt-2 flex items-center justify-between">
        <label>{t('receive_push_notifications')}</label>
        <Switch checked={isSubscribed} onCheckedChange={handleToggle} />
      </div>

      <AlertModal
        open={showDisableModal}
        onOpenChange={setShowDisableModal}
        type="warning"
        title={t('disable_push_notifications_title')}
        description={t('disable_push_notifications_description')}
        primaryButton={{
          text: t('disable_button'),
          onClick: handleDisablePushNotifications,
          variant: 'default'
        }}
      />
    </>
  )
}
