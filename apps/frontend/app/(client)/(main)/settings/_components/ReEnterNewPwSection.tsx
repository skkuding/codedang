import { Input } from '@/components/shadcn/input'
import invisibleIcon from '@/public/icons/invisible.svg'
import visibleIcon from '@/public/icons/visible.svg'
import type { SettingsFormat } from '@/types/type'
import Image from 'next/image'
import React from 'react'
import type { UseFormGetValues } from 'react-hook-form'
import { useSettingsContext } from './context'

interface ReEnterNewPwSectionProps {
  newPasswordAble: boolean
  getValues: UseFormGetValues<SettingsFormat>
  confirmPassword: string
  isPasswordsMatch: boolean
}

export function ReEnterNewPwSection({
  newPasswordAble,
  getValues,
  confirmPassword,
  isPasswordsMatch
}: ReEnterNewPwSectionProps) {
  const {
    updateNow,
    passwordState: { confirmPasswordShow, setConfirmPasswordShow },
    formState: { register }
  } = useSettingsContext()

  return (
    <>
      {/* Re-enter new password */}
      <div className="flex items-center gap-2">
        <div className="relative w-full justify-between">
          <Input
            type={confirmPasswordShow ? 'text' : 'password'}
            placeholder="Re-enter new password"
            disabled={updateNow ? true : !newPasswordAble}
            {...register('confirmPassword')}
            className={`flex justify-stretch border-neutral-300 ring-0 placeholder:text-neutral-400 focus-visible:ring-0 disabled:bg-neutral-200 ${
              isPasswordsMatch
                ? 'border-primary'
                : confirmPassword && 'border-red-500'
            } `}
          />
          <span
            className="absolute right-0 top-0 flex h-full items-center p-3"
            onClick={() => setConfirmPasswordShow(!confirmPasswordShow)}
          >
            <Image
              src={confirmPasswordShow ? visibleIcon : invisibleIcon}
              alt={confirmPasswordShow ? 'visible' : 'invisible'}
            />
          </span>
        </div>
      </div>
      {getValues('confirmPassword') &&
        (isPasswordsMatch ? (
          <div className="text-primary -mt-4 inline-flex items-center text-xs">
            Correct
          </div>
        ) : (
          <div className="-mt-4 inline-flex items-center text-xs text-red-500">
            Incorrect
          </div>
        ))}
    </>
  )
}
