import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import invisibleIcon from '@/public/icons/invisible.svg'
import visibleIcon from '@/public/icons/visible.svg'
import type { SettingsFormat } from '@/types/type'
import Image from 'next/image'
import React from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

interface NewPwSectionProps {
  newPasswordShow: boolean
  setNewPasswordShow: React.Dispatch<React.SetStateAction<boolean>>
  newPasswordAble: boolean
  isPasswordsMatch: boolean
  newPassword: string
  confirmPassword: string
  updateNow: boolean
  register: UseFormRegister<SettingsFormat>
  errors: FieldErrors<SettingsFormat>
}

export default function NewPwSection({
  newPasswordShow,
  setNewPasswordShow,
  newPasswordAble,
  isPasswordsMatch,
  newPassword,
  confirmPassword,
  updateNow,
  register,
  errors
}: NewPwSectionProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative w-full justify-between">
          <Input
            type={newPasswordShow ? 'text' : 'password'}
            placeholder="New password"
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
              alt={newPasswordShow ? 'visible' : 'invisible'}
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
            <li>8-20 characters</li>
            <li>
              Include two of the following: capital letters, small letters,
              numbers
            </li>
          </ul>
        </div>
      )}
    </>
  )
}
