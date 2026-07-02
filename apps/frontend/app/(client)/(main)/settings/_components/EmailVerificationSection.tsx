'use client'

import { ALLOWED_DOMAINS } from '@/libs/constants'
import { safeFetcher, safeFetcherWithAuth } from '@/libs/utils'
import { useState } from 'react'
import { toast } from 'sonner'
import { useSettingsContext } from './context'

export function EmailVerificationSection() {
  const { defaultProfileValues, isLoading } = useSettingsContext()

  const [newEmail, setNewEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [pinSent, setPinSent] = useState(false)

  const email = defaultProfileValues.email ?? ''
  const atIndex = email.indexOf('@')
  const emailUser = atIndex >= 0 ? email.slice(0, atIndex) : email
  const emailDomain = atIndex >= 0 ? email.slice(atIndex) : ''

  const isSkkuStudent = ALLOWED_DOMAINS.some((domain) =>
    email.endsWith(`@${domain}`)
  )

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleSendVerification = async () => {
    if (!newEmail) {
      toast.error('새 이메일을 입력해주세요.')
      return
    }
    if (!isValidEmail(newEmail)) {
      toast.error('올바른 이메일 형식으로 입력해주세요.')
      return
    }
    setIsSending(true)
    try {
      await safeFetcher.post('email-auth/send-email/register-new', {
        json: { email: newEmail }
      })
      setPinSent(true)
      toast.success('인증 메일이 발송되었습니다.')
    } catch {
      toast.error('인증 메일 발송에 실패했습니다.')
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationCode) {
      toast.error('인증 번호를 입력해주세요.')
      return
    }
    setIsVerifying(true)
    try {
      const response = await safeFetcher.post('email-auth/verify-pin', {
        json: { pin: verificationCode, email: newEmail }
      })
      const token = response.headers.get('email-auth') ?? ''
      await safeFetcherWithAuth.patch('user/email', {
        json: { email: newEmail },
        headers: { 'email-auth': token }
      })
      toast.success('이메일이 변경되었습니다.')
      setPinSent(false)
      setNewEmail('')
      setVerificationCode('')
    } catch {
      toast.error('인증에 실패했습니다. 인증 번호를 확인해주세요.')
    } finally {
      setIsVerifying(false)
    }
  }

  if (isSkkuStudent) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium leading-[1.4] tracking-[-0.36px] text-[#1c1c1c]">
          이메일
        </label>
        <div className="flex h-[46px] items-center justify-between rounded-xl border border-[#d8d8d8] bg-[#e5e5e5] px-5 py-[11px]">
          <span className="text-base font-medium tracking-[-0.48px] text-[#9b9b9b]">
            {isLoading ? 'Loading...' : emailUser}
          </span>
          <span className="text-base font-medium tracking-[-0.48px] text-[#9b9b9b]">
            {isLoading ? '' : emailDomain}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium leading-[1.4] tracking-[-0.36px] text-[#1c1c1c]">
            현재 이메일
          </label>
          <div className="flex h-[46px] items-center justify-between rounded-xl border border-[#d8d8d8] bg-[#e5e5e5] px-5 py-[11px]">
            <span className="text-base font-medium tracking-[-0.48px] text-[#9b9b9b]">
              {isLoading ? 'Loading...' : emailUser}
            </span>
            <span className="text-base font-medium tracking-[-0.48px] text-[#9b9b9b]">
              {isLoading ? '' : emailDomain}
            </span>
          </div>
        </div>

        <div className="flex items-end gap-1.5">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label className="text-xs font-medium leading-[1.4] tracking-[-0.36px] text-[#1c1c1c]">
              새 이메일
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="변경할 이메일을 입력해주세요"
              className="focus:border-primary h-[46px] w-full rounded-xl border border-[#d8d8d8] bg-white px-5 py-[11px] text-base font-medium tracking-[-0.48px] text-[#474747] outline-none placeholder:text-[#c4c4c4]"
            />
          </div>
          <button
            type="button"
            onClick={handleSendVerification}
            disabled={isSending || isLoading || !newEmail}
            className="text-primary h-[46px] shrink-0 rounded-xl border border-[#619cfb] bg-white px-5 py-[13px] text-base font-semibold tracking-[-0.64px] disabled:opacity-50"
          >
            인증하기
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-end gap-1.5">
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          placeholder="메일로 도착한 인증 번호를 입력해주세요"
          disabled={!pinSent}
          className="focus:border-primary h-[46px] min-w-0 flex-1 rounded-xl border border-[#d8d8d8] bg-white px-5 py-[11px] text-base font-medium tracking-[-0.48px] text-[#474747] outline-none placeholder:text-[#c4c4c4] disabled:bg-[#e5e5e5] disabled:text-[#9b9b9b]"
        />
        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying || !pinSent || !verificationCode}
          className="bg-primary h-[46px] shrink-0 rounded-xl px-5 py-[13px] text-base font-semibold tracking-[-0.64px] text-white disabled:opacity-50"
        >
          인증확인
        </button>
      </div>
    </div>
  )
}
