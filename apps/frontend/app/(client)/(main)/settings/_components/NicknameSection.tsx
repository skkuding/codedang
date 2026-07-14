'use client'

import { cn } from '@/libs/utils'
import type { SettingsFormat } from '@/types/type'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { useSettingsContext } from './context'

interface NicknameSectionProps {
  register: UseFormRegister<SettingsFormat>
  errors: FieldErrors<SettingsFormat>
}

export function NicknameSection({ register, errors }: NicknameSectionProps) {
  const { isLoading } = useSettingsContext()

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label className="text-caption2_m_12 text-color-neutral-15">닉네임</label>
      <input
        placeholder={isLoading ? 'Loading...' : '닉네임을 입력해주세요'}
        {...register('nickname')}
        className={cn(
          'focus:border-primary border-line text-body1_m_16 text-color-neutral-30 placeholder:text-color-neutral-90 h-[46px] w-full rounded-xl border bg-white px-5 py-[11px] outline-none',
          errors.nickname && 'border-error'
        )}
      />
      {errors.nickname && (
        <p className="text-caption4_r_12 text-error">
          {errors.nickname.message}
        </p>
      )}
    </div>
  )
}
