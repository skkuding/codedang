import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import invisibleIcon from '@/public/icons/invisible.svg'
import visibleIcon from '@/public/icons/visible.svg'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import React from 'react'
import { useSettingsContext } from './context'

interface NewPwSectionProps {
  newPasswordAble: boolean
  isPasswordsMatch: boolean
  newPassword: string
  confirmPassword: string
}

export function NewPwSection({
  newPasswordAble,
  isPasswordsMatch,
  newPassword,
  confirmPassword
}: NewPwSectionProps) {
  const {
    passwordState: { newPasswordShow, setNewPasswordShow },
    updateNow,
    formState: { register, errors }
  } = useSettingsContext()

  const { t } = useTranslate()

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative w-full justify-between">
          <Input
            type={newPasswordShow ? 'text' : 'password'}
            placeholder={t('new_password_placeholder')}
            disabled={updateNow ? true : !newPasswordAble}
            {...register('newPassword')}
            className={cn(
              'flex justify-stretch border-neutral-300 ring-0 placeholder:text-neutral-400 focus-visible:ring-0 disabled:bg-neutral-200',
              isPasswordsMatch
                ? 'border-primary'
                : (errors.newPassword && newPassword && 'border-red-500') ||
                    (confirmPassword && 'border-red-500')
            )}
          />
          <span
            className="absolute right-0 top-0 flex h-full items-center p-3"
            onClick={() => setNewPasswordShow(!newPasswordShow)}
          >
            <Image
              src={newPasswordShow ? visibleIcon : invisibleIcon}
              alt={newPasswordShow ? t('visible_alt') : t('invisible_alt')}
            />
          </span>
        </div>
      </div>
      {errors.newPassword && newPasswordAble && (
        <div
          className={cn(
            '-mt-3 inline-flex items-center text-xs',
            newPassword && 'text-red-500'
          )}
        >
          <ul>
            <li>{t('password_criteria_8_20_chars')}</li>
            <li>{t('password_criteria_include_two')}</li>
          </ul>
        </div>
      )}
    </>
  )
}
