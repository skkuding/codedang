'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { AlertModal } from '../AlertModal'

// 이벤트 타입 -> 메시지 매핑
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
    title: '푸시 알림 미지원',
    description:
      '이 브라우저에선 푸시 알림을 사용할 수 없어요.\n\nNotice를 참고해 PWA 설치 후 이용해주세요.',
    showNoticeButton: true,
    isWarning: true
  },
  'push:denied': {
    title: '알림 권한 차단됨',
    description:
      '브라우저에서 알림 권한이 차단됐어요.\n\n설정에서 권한을 허용한 뒤 다시 시도해주세요.',
    showNoticeButton: true,
    isWarning: true
  },
  'push:error': {
    title: '구독 실패',
    description:
      '푸시 구독 중 오류가 발생했어요.\n\n잠시 후 다시 시도해주세요.',
    isWarning: true
  },
  'push:subscribed': {
    title: '구독 완료',
    description: '푸시 알림이 활성화되었어요!'
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
      showCancelButton
      title={data?.title || ''}
      description={data?.description || ''}
      primaryButton={{
        text: data?.showNoticeButton ? 'Go to Notice' : 'OK',
        onClick: data?.showNoticeButton ? handleNoticeClick : handleClose
      }}
    />
  )
}
