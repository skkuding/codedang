'use client'

import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { AlertModal } from '../AlertModal'

const messages = (
  t: (key: string) => string
): Record<
  string,
  {
    title: string
    description: string
    showNoticeButton?: boolean
    isWarning?: boolean
  }
> => {
  return {
    'push:unsupported': {
      title: t('push_notifications_unavailable_title'),
      description: t('push_notifications_unavailable_description'),
      showNoticeButton: true,
      isWarning: true
    },
    'push:denied': {
      title: t('notifications_blocked_title'),
      description: t('notifications_blocked_description'),
      showNoticeButton: true,
      isWarning: true
    },
    'push:error': {
      title: t('subscription_failed_title'),
      description: t('subscription_failed_description'),
      isWarning: true
    },
    'push:subscribed': {
      title: t('subscription_successful_title'),
      description: t('subscription_successful_description')
    }
  }
}

export function PushPermissionModal() {
  const { t } = useTranslate()
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
    const keys = Object.keys(messages(t))
    keys.forEach((k) => window.addEventListener(k, handler))
    return () => {
      keys.forEach((k) => window.removeEventListener(k, handler))
    }
  }, [handleEvent, t])

  const data = eventKey ? messages(t)[eventKey] : null

  const handleNoticeClick = () => {
    router.push('/notice/7')
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
        text: data?.showNoticeButton ? t('read_notice_button') : t('ok_button'),
        onClick: data?.showNoticeButton ? handleNoticeClick : handleClose
      }}
    />
  )
}
