'use client'

import { Switch } from '@/components/shadcn/switch'
import { toast } from 'sonner'

export function EmailNotificationSection() {
  return (
    <div className="border-color-cool-neutral-90 rounded-2xl border bg-white px-5 py-7">
      <div className="flex items-center justify-between">
        <p className="text-body2_m_14 text-color-cool-neutral-40">
          내 질문에 답변이 등록 되면 이메일로 알림을 받겠습니다.
        </p>
        <Switch
          checked={false}
          onCheckedChange={() => toast.info('준비 중인 기능입니다.')}
        />
      </div>
    </div>
  )
}
