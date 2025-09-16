'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { AlertModal } from '../AlertModal'

const messages: Record<
  string,
  {
    title: string
    description: string
    showNoticeButton?: boolean
    isWarning?: boolean
  }
> = {
  'push:unsupported': {
    title: 'Push Notifications Unavailable',
    description:
      "Your current browser doesn't support push notifications.\n\nPlease refer to the Notice and install the PWA to use this feature.",
    showNoticeButton: true,
    isWarning: true
  },
  'push:denied': {
    title: 'Push Notification Permission Denied',
    description:
      'Push notification permission has been denied in your browser.\n\nPlease allow permission in your settings and try again.',
    showNoticeButton: true,
    isWarning: true
  },
  'push:error': {
    title: 'Subscription Failed',
    description:
      'Error occurred while subscribing to push notifications.\n\nPlease try again in a little while.',
    isWarning: true
  },
  'push:subscribed': {
    title: 'Subscription Successful',
    description: 'Push notifications are now enabled!'
  }
}

export function PushPermissionModal() {
  const [open, setOpen] = useState(false)
  const [eventKey, setEventKey] = useState<string | null>(null)
  const router = useRouter()

  const handleEvent = useCallback((key: string) => {
    setEventKey(key)
    setOpen(true)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      handleEvent((e as CustomEvent).type)
    }
    const keys = Object.keys(messages)
    keys.forEach((k) => window.addEventListener(k, handler))
    return () => {
      keys.forEach((k) => window.removeEventListener(k, handler))
    }
  }, [handleEvent])

  const data = eventKey ? messages[eventKey] : null

  const handleNoticeClick = () => {
    router.push('/notice')
    setOpen(false)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <AlertModal
      open={open}
      onOpenChange={setOpen}
      size="sm"
      type={data?.isWarning ? 'warning' : 'confirm'}
      showIcon
      showCancelButton={data?.showNoticeButton ?? false}
      title={data?.title || ''}
      description={data?.description || ''}
      primaryButton={{
        text: data?.showNoticeButton ? 'Read Notice' : '',
        onClick: data?.showNoticeButton ? handleNoticeClick : handleClose
      }}
    />
  )
}
