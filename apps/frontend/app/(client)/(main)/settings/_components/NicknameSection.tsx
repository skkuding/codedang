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
  const { isLoading, defaultProfileValues } = useSettingsContext()

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label className="text-xs font-medium leading-[1.4] tracking-[-0.36px] text-[#1c1c1c]">
        닉네임
      </label>
      <input
        placeholder={
          isLoading
            ? 'Loading...'
            : (defaultProfileValues.nickname ?? '닉네임을 입력해주세요')
        }
        {...register('nickname')}
        className={cn(
          'focus:border-primary h-[46px] w-full rounded-xl border border-[#d8d8d8] bg-white px-5 py-[11px] text-base font-medium tracking-[-0.48px] text-[#474747] outline-none placeholder:text-[#c4c4c4]',
          errors.nickname && 'border-red-500'
        )}
      />
      {errors.nickname && (
        <p className="text-xs text-red-500">{errors.nickname.message}</p>
      )}
    </div>
  )
}
