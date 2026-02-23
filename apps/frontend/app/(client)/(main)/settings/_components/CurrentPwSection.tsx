import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import invisibleIcon from '@/public/icons/invisible.svg'
import visibleIcon from '@/public/icons/visible.svg'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import React from 'react'
import { FaCheck } from 'react-icons/fa6'
import { useSettingsContext } from './context'

interface CurrentPwSectionProps {
  currentPassword: string
  isCheckButtonClicked: boolean
  isPasswordCorrect: boolean
  checkPassword: () => Promise<void>
}

export function CurrentPwSection({
  currentPassword,
  isCheckButtonClicked,
  isPasswordCorrect,
  checkPassword
}: CurrentPwSectionProps) {
  const {
    passwordState: { passwordShow, setPasswordShow },
    updateNow,
    formState: { register, errors }
  } = useSettingsContext()
  const { t } = useTranslate()

  return (
    <>
      <label className="-mb-4 mt-4 text-xs">{t('password_label')}</label>
      <div className="flex items-center gap-2">
        <div className="relative w-full justify-between">
          <Input
            type={passwordShow ? 'text' : 'password'}
            placeholder={t('current_password_placeholder')}
            {...register('currentPassword')}
            disabled={
              updateNow ? true : isCheckButtonClicked && isPasswordCorrect
            }
            className={cn(
              'flex justify-stretch border-neutral-300 text-neutral-600 ring-0 placeholder:text-neutral-400 focus-visible:ring-0 disabled:bg-neutral-200 disabled:text-neutral-400',
              errors.currentPassword && 'border-red-500',
              isCheckButtonClicked &&
                (isPasswordCorrect ? 'border-primary' : 'border-red-500')
            )}
          />
          <span
            className="absolute right-0 top-0 flex h-full items-center p-3"
            onClick={() => setPasswordShow(!passwordShow)}
          >
            <Image
              src={passwordShow ? visibleIcon : invisibleIcon}
              alt={passwordShow ? t('visible_alt') : t('invisible_alt')}
            />
          </span>
        </div>
        <Button
          disabled={!currentPassword}
          className="h-4/5 px-2 disabled:bg-neutral-400"
          onClick={() => {
            checkPassword()
          }}
        >
          <FaCheck size={20} />
        </Button>
      </div>
      {errors.currentPassword &&
        errors.currentPassword.message === 'Required' && (
          <div className="-mt-4 inline-flex items-center text-xs text-red-500">
            {t('required_message')}
          </div>
        )}
      {!errors.currentPassword &&
        isCheckButtonClicked &&
        (isPasswordCorrect ? (
          <div className="text-primary -mt-4 inline-flex items-center text-xs">
            {t('correct_message')}
          </div>
        ) : (
          <div className="-mt-4 inline-flex items-center text-xs text-red-500">
            {t('incorrect_message')}
          </div>
        ))}
    </>
  )
}
