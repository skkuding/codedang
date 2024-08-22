'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import codedangSymbol from '@/public/codedang-editor.svg'
import invisible from '@/public/invisible.png'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import React from 'react'
import { useForm } from 'react-hook-form'
import { FaCheck } from 'react-icons/fa6'
// import { IoWarningOutline } from 'react-icons/io5'
import { z } from 'zod'

interface SettingsFormat {
  // username: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  name: string
  major: string
  // studentId: string
  // email: string
  // verificationCode: string
  // firstName: string
  // lastName: string
}

const schema = z
  .object({
    // currentPassword: z.string().min(1, { message: 'Required' }),
    currentPassword: z
      .string()
      .min(1, { message: 'Required' })
      .min(8)
      .max(20)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      }),
    // newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }).optional(),
    newPassword: z
      .string()
      .min(1, { message: 'Required' })
      .min(8)
      .max(20)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      }),
    // confirmPassword: z.string().optional(),
    confirmPassword: z.string().min(1, { message: 'Required' }),
    name: z
      .string()
      .min(1, { message: 'Required' })
      .regex(/^[a-zA-Z]+$/, { message: 'only English supported' })
  })
  .refine(
    (data: { newPassword: string; confirmPassword: string }) =>
      data.newPassword === data.confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'Incorrect'
    }
  )

function requiredMessage(message?: string) {
  return (
    <div className="inline-flex items-center text-xs text-red-500">
      {message === 'Required'}
      <p className={cn(message === 'Required' && 'pl-1')}>{message}</p>
    </div>
  )
}

export default function Page() {
  const {
    register,
    handleSubmit,
    // watch,
    // formState: { errors, isDirty, isValid }
    formState: { errors }
  } = useForm<SettingsFormat>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      name: '',
      major: ''
    }
  })

  // const currentPassword = watch('currentPassword')

  const onSubmit = () => {}

  return (
    <div className="flex w-full gap-20 py-6">
      <div
        className="flex h-svh max-h-[846px] w-full flex-col items-center justify-center gap-3 rounded-2xl"
        style={{
          background: `var(--banner,
            linear-gradient(325deg, rgba(79, 86, 162, 0.00) 28.16%, rgba(79, 86, 162, 0.50) 93.68%),
            linear-gradient(90deg, #3D63B8 0%, #0E1322 100%)
          )`
        }}
      >
        <div className="flex items-center gap-3">
          <Image src={codedangSymbol} alt="codedang" width={65} />
          <p className="font-mono text-[40px] font-bold text-white">CODEDANG</p>
        </div>
        <p className="font-medium text-white">Online Judge Platform for SKKU</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-svh max-h-[846px] w-full flex-col justify-between gap-4 px-4"
      >
        <h1 className="-mb-1 text-center text-2xl font-bold">Settings</h1>
        <p className="text-center text-sm text-neutral-500">
          You can change your information
        </p>
        <label className="-mb-2 text-xs">ID</label>
        <Input
          placeholder="user01"
          disabled={true}
          className="border-neutral-300 bg-neutral-100 placeholder:text-neutral-400"
        />

        <label className="-mb-2 mt-4 text-xs">Password</label>
        <div className="flex items-center gap-2">
          <div className="relative w-full justify-between">
            <Input
              placeholder="Current password"
              {...register('currentPassword')}
              className={`flex justify-stretch text-neutral-400 placeholder:text-neutral-300 ${errors.currentPassword ? 'ring-red-500 focus-visible:ring-red-500' : ''}`}
            />
            <span className="absolute right-0 top-0 flex h-full items-center p-3">
              <Image src={invisible} alt="codedang" className="h-6 w-6" />
            </span>
          </div>
          <Button className="h-4/5 px-2">
            <FaCheck size={20} />
          </Button>
        </div>
        <div className="-mt-2 text-xs">{requiredMessage('Required')}</div>

        <div className="flex items-center gap-2">
          <div className="relative w-full justify-between">
            <Input
              placeholder="New password"
              disabled={true}
              className="flex justify-stretch border-neutral-300 bg-neutral-100 placeholder:text-neutral-400"
            />
            <span className="absolute right-0 top-0 flex h-full items-center p-3">
              <Image src={invisible} alt="codedang" className="h-6 w-6" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full justify-between">
            <Input
              placeholder="Re-enter new password"
              disabled={true}
              className="flex justify-stretch border-neutral-300 bg-neutral-100 placeholder:text-neutral-400"
            />
            <span className="absolute right-0 top-0 flex h-full items-center p-3">
              <Image src={invisible} alt="codedang" className="h-6 w-6" />
            </span>
          </div>
        </div>

        <hr className="my-4 border-neutral-200" />

        <label className="-mb-2 text-xs">Name</label>
        <Input
          placeholder="홍길동"
          className="text-neutral-400 placeholder:text-neutral-300"
        />

        <label className="-mb-2 mt-2 text-xs">Student ID</label>
        <Input
          placeholder="홍길동"
          className="text-neutral-400 placeholder:text-neutral-300"
        />

        <label className="-mb-2 mt-2 text-xs">First Major</label>
        <Input
          placeholder="홍길동"
          className="text-neutral-400 placeholder:text-neutral-300"
        />

        <div className="mt-2 text-end">
          <Button
            disabled={true}
            className="font-semibold disabled:bg-neutral-300 disabled:text-neutral-500"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
