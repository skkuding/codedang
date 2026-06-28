'use client'

import { Switch } from '@/components/shadcn/switch'
import { safeFetcherWithAuth } from '@/libs/utils'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function EmailNotificationSection() {
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await safeFetcherWithAuth
          .get('notification/email-subscription')
          .json<{ isSubscribed: boolean }>()
        setIsSubscribed(data.isSubscribed)
      } catch {
        // Not subscribed or endpoint not available
      }
    }
    fetchStatus()
  }, [])

  const handleToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await safeFetcherWithAuth.post('notification/email-subscription').json()
        setIsSubscribed(true)
        toast.success('이메일 알림이 활성화되었습니다.')
      } else {
        await safeFetcherWithAuth
          .delete('notification/email-subscription')
          .json()
        setIsSubscribed(false)
        toast.success('이메일 알림이 비활성화되었습니다.')
      }
    } catch {
      toast.error('알림 설정 변경에 실패했습니다.')
    }
  }

  return (
    <div className="rounded-2xl border border-[#dce3e5] bg-white px-5 py-7">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium leading-[1.5] tracking-[-0.42px] text-[#5f6566]">
          내 질문에 답변이 등록 되면 이메일로 알림을 받겠습니다.
        </p>
        <Switch checked={isSubscribed} onCheckedChange={handleToggle} />
      </div>
    </div>
  )
}
