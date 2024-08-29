'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { majors } from '@/lib/constants'
import { cn, safeFetcher, safeFetcherWithAuth } from '@/lib/utils'
import invisible from '@/public/24_invisible.svg'
import visible from '@/public/24_visible.svg'
import codedangSymbol from '@/public/codedang-editor.svg'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Route } from 'next'
import type { NavigateOptions } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaCheck, FaChevronDown } from 'react-icons/fa6'
import { toast } from 'sonner'
import { z } from 'zod'

interface SettingsFormat {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  realName: string
  studentId: string
}

interface getProfile {
  username: string // ID
  userProfile: {
    realName: string
  }
  studentId: string
  major: string
}

type UpdatePayload = Partial<{
  password: string
  newPassword: string
  realName: string
  studentId: string
  major: string
}>

const schemaSettings = (updateNow: boolean) =>
  z.object({
    currentPassword: z.string().min(1, { message: 'Required' }).optional(),
    newPassword: z
      .string()
      .min(1)
      .min(8)
      .max(20)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      })
      .optional(),
    confirmPassword: z.string().optional(),
    realName: z
      .string()
      .regex(/^[a-zA-Z\s]+$/, { message: 'Only English Allowed' })
      .optional(),
    studentId: updateNow
      ? z.string().regex(/^\d{10}$/, { message: 'Only 10 numbers' })
      : z.string().optional()
  })

function requiredMessage(message?: string) {
  return (
    <div className="-mt-4 inline-flex items-center text-xs text-red-500">
      {message}
    </div>
  )
}

export default function Page() {
  const searchParams = useSearchParams()
  const updateNow = searchParams.get('updateNow')
  const router = useRouter()
  const [bypassConfirmation, setBypassConfirmation] = useState<boolean>(false)

  const [defaultProfileValues, setdefaultProfileValues] = useState<getProfile>({
    username: '',
    userProfile: {
      realName: ''
    },
    studentId: '',
    major: ''
  })

  useEffect(() => {
    const fetchDefaultProfile = async () => {
      try {
        const data: getProfile = await safeFetcherWithAuth.get('user').json()
        setMajorValue(data.major)
        setdefaultProfileValues(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        toast.error('Failed to load profile data')
        setIsLoading(false)
      }
    }
    fetchDefaultProfile()
  }, [])

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<SettingsFormat>({
    resolver: zodResolver(schemaSettings(updateNow === 'true')),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      realName: defaultProfileValues.userProfile?.realName ?? '',
      studentId: defaultProfileValues.studentId
    }
  })

  // const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
  //   // Recommended
  //   event.preventDefault()

  //   // Included for legacy support, e.g. Chrome/Edge < 119
  //   event.returnValue = true
  //   return true
  // }

  /**
   * Prompt the user with a confirmation dialog when they try to navigate away from the page.
   */
  const useConfirmNavigation = () => {
    useEffect(() => {
      const originalPush = router.push
      const newPush = (
        href: string,
        options?: NavigateOptions | undefined
      ): void => {
        if (updateNow === 'true') {
          toast.error('You cannot leave the page without saving your changes')
          return
        }
        if (!bypassConfirmation) {
          const isConfirmed = window.confirm(
            'Are you sure you want to leave?\nYour changes have not been saved.\nIf you leave this page, all changes will be lost.\nDo you still want to proceed?'
          )
          if (isConfirmed) return
        }
        originalPush(href as Route, options)
      }
      router.push = newPush
      // window.onbeforeunload = beforeUnloadHandler
      return () => {
        router.push = originalPush
        // window.onbeforeunload = null
      }
    }, [router, isDirty, bypassConfirmation])
  }

  useConfirmNavigation()

  const [isCheckButtonClicked, setIsCheckButtonClicked] =
    useState<boolean>(false)
  const [isPasswordCorrect, setIsPasswordCorrect] = useState<boolean>(false)
  const [newPasswordAble, setNewPasswordAble] = useState<boolean>(false)
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [newPasswordShow, setNewPasswordShow] = useState<boolean>(false)
  const [confirmPasswordShow, setConfirmPasswordShow] = useState<boolean>(false)
  const [majorOpen, setMajorOpen] = useState<boolean>(false)
  const [majorValue, setMajorValue] = useState<string>('')
  const currentPassword = watch('currentPassword')
  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')
  const realName = watch('realName')
  const studentId = watch('studentId')
  const isPasswordsMatch = newPassword === confirmPassword && newPassword !== ''
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const saveAblePassword: boolean =
    !!currentPassword &&
    !!newPassword &&
    !!confirmPassword &&
    isPasswordCorrect &&
    newPasswordAble &&
    isPasswordsMatch
  const saveAbleOthers: boolean =
    !!realName || !!(majorValue !== defaultProfileValues.major)
  const saveAble = (saveAblePassword || saveAbleOthers) && isPasswordsMatch
  const saveAbleUpdateNow =
    !!studentId && majorValue !== 'none' && !errors.studentId

  // New Password Input 창과 Re-enter Password Input 창의 border 색상을, 일치하는지 여부에 따라 바꿈
  useEffect(() => {
    if (isPasswordsMatch) {
      setValue('newPassword', newPassword)
      setValue('confirmPassword', confirmPassword)
    }
  }, [isPasswordsMatch, newPassword, confirmPassword])

  const onSubmit = async (data: SettingsFormat) => {
    try {
      // 필요 없는 필드 제외 (defaultProfileValues와 값이 같은 것들은 제외)
      const updatePayload: UpdatePayload = {}
      if (data.realName !== defaultProfileValues.userProfile?.realName) {
        updatePayload.realName = data.realName
      }
      if (majorValue !== defaultProfileValues.major) {
        updatePayload.major = majorValue
      }
      if (data.currentPassword !== 'tmppassword1') {
        updatePayload.password = data.currentPassword
      }
      if (data.newPassword !== 'tmppassword1') {
        updatePayload.newPassword = data.newPassword
      }
      if (updateNow === 'true' && data.studentId !== '0000000000') {
        updatePayload.studentId = data.studentId
      }

      const response = await safeFetcherWithAuth.patch('user', {
        json: updatePayload
      })
      if (response.ok) {
        toast.success('Successfully updated your information')
        setBypassConfirmation(true)
        setTimeout(() => {
          updateNow === 'true' ? router.push('/') : window.location.reload()
        }, 1500)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to update your information, Please try again')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  const onSubmitClick = () => {
    return () => {
      // submit 되기위해, watch로 확인되는 값이 default값과 같으면 setValue를 통해서 defaultProfileValues로 변경
      if (realName === '') {
        setValue('realName', defaultProfileValues.userProfile?.realName)
      }
      if (majorValue === defaultProfileValues.major) {
        setMajorValue(defaultProfileValues.major)
      }
      if (currentPassword === '') {
        setValue('currentPassword', 'tmppassword1')
      }
      if (newPassword === '') {
        setValue('newPassword', 'tmppassword1')
      }
      if (confirmPassword === '') {
        setValue('confirmPassword', 'tmppassword1')
      }
    }
  }

  const checkPassword = async () => {
    setIsCheckButtonClicked(true)
    try {
      const response = await safeFetcher.post('auth/login', {
        json: {
          username: defaultProfileValues.username,
          password: currentPassword
        }
      })

      if (response.status === 201) {
        setIsPasswordCorrect(true)
        setNewPasswordAble(true)
      }
    } catch {
      console.error('Failed to check password')
    }
  }

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
          {updateNow
            ? 'You must update your information'
            : 'You can change your information'}
        </p>

        {/* ID */}
        <label className="-mb-4 text-xs">ID</label>
        <Input
          placeholder={isLoading ? 'Loading...' : defaultProfileValues.username}
          disabled={true}
          className="border-neutral-300 text-neutral-600 placeholder:text-neutral-400 disabled:bg-neutral-200"
        />

        {/* Current password */}
        <label className="-mb-4 mt-4 text-xs">Password</label>
        <div className="flex items-center gap-2">
          <div className="relative w-full justify-between">
            <Input
              type={passwordShow ? 'text' : 'password'}
              placeholder="Current password"
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
              {passwordShow ? (
                <Image src={visible} alt="visible" />
              ) : (
                <Image src={invisible} alt="invisible" />
              )}
            </span>
          </div>
          <Button
            disabled={!currentPassword}
            className="h-4/5 px-2 disabled:bg-neutral-400"
            onClick={checkPassword}
          >
            <FaCheck size={20} />
          </Button>
        </div>
        {errors.currentPassword &&
          errors.currentPassword.message === 'Required' &&
          requiredMessage('Required')}
        {!errors.currentPassword &&
          isCheckButtonClicked &&
          (isPasswordCorrect ? (
            <div className="text-primary -mt-4 inline-flex items-center text-xs">
              Correct
            </div>
          ) : (
            <div className="-mt-4 inline-flex items-center text-xs text-red-500">
              Incorrect
            </div>
          ))}

        {/* New password */}
        <div className="flex items-center gap-2">
          <div className="relative w-full justify-between">
            <Input
              type={newPasswordShow ? 'text' : 'password'}
              placeholder="New password"
              disabled={updateNow ? true : !newPasswordAble}
              {...register('newPassword')}
              className={`flex justify-stretch border-neutral-300 ring-0 placeholder:text-neutral-400 focus-visible:ring-0 disabled:bg-neutral-200 ${
                isPasswordsMatch
                  ? 'border-primary'
                  : (errors.newPassword && newPassword && 'border-red-500') ||
                    (confirmPassword && 'border-red-500')
              } `}
            />
            <span
              className="absolute right-0 top-0 flex h-full items-center p-3"
              onClick={() => setNewPasswordShow(!newPasswordShow)}
            >
              {newPasswordShow ? (
                <Image src={visible} alt="visible" />
              ) : (
                <Image src={invisible} alt="invisible" />
              )}
            </span>
          </div>
        </div>
        {errors.newPassword && newPasswordAble && (
          <div
            className={`-mt-3 inline-flex items-center text-xs ${newPassword && 'text-red-500'}`}
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

        {/* Re-enter new password */}
        <div className="flex items-center gap-2">
          <div className="relative w-full justify-between">
            <Input
              type={confirmPasswordShow ? 'text' : 'password'}
              placeholder="Re-enter new password"
              disabled={updateNow ? true : !newPasswordAble}
              {...register('confirmPassword', {
                validate: (val: string) => {
                  if (watch('newPassword') != val) {
                    return 'Incorrect'
                  }
                }
              })}
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
              {confirmPasswordShow ? (
                <Image src={visible} alt="visible" />
              ) : (
                <Image src={invisible} alt="invisible" />
              )}
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

        <hr className="my-4 border-neutral-200" />

        {/* Name */}
        <label className="-mb-4 text-xs">Name</label>
        <Input
          placeholder={
            isLoading
              ? 'Loading...'
              : defaultProfileValues.userProfile?.realName
          }
          disabled={!!updateNow}
          {...register('realName')}
          className={`${realName && (errors.realName ? 'border-red-500' : 'border-primary')} placeholder:text-neutral-400 focus-visible:ring-0 disabled:bg-neutral-200`}
        />
        {realName &&
          errors.realName &&
          requiredMessage(errors.realName.message)}

        {/* Student ID */}
        <label className="-mb-4 mt-2 text-xs">Student ID</label>
        <Input
          placeholder={
            updateNow
              ? '2024123456'
              : isLoading
                ? 'Loading...'
                : defaultProfileValues.studentId
          }
          disabled={!updateNow}
          {...register('studentId')}
          className={cn(
            'text-neutral-600 placeholder:text-neutral-400 focus-visible:ring-0',
            updateNow
              ? errors.studentId || !studentId
                ? 'border-red-500'
                : 'border-primary'
              : 'border-neutral-300 disabled:bg-neutral-200'
          )}
        />
        {errors.studentId && requiredMessage(errors.studentId.message)}

        {/* First Major */}
        <label className="-mb-4 mt-2 text-xs">First Major</label>
        <div className="flex flex-col gap-1">
          <Popover open={majorOpen} onOpenChange={setMajorOpen} modal={true}>
            <PopoverTrigger asChild>
              <Button
                aria-expanded={majorOpen}
                variant="outline"
                role="combobox"
                className={cn(
                  'justify-between border-gray-200 font-normal text-neutral-600 hover:bg-white',
                  updateNow
                    ? `${majorValue === 'none' || isLoading ? 'border-red-500 text-neutral-400' : 'border-primary'}`
                    : majorValue === defaultProfileValues.major
                      ? 'text-neutral-400'
                      : 'border-primary'
                )}
              >
                {isLoading
                  ? 'Loading...'
                  : updateNow
                    ? majorValue === 'none'
                      ? 'Department Information Unavailable / 학과 정보 없음'
                      : majorValue
                    : !majorValue
                      ? defaultProfileValues.major
                      : majorValue}
                <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[555px] p-0">
              <Command>
                <CommandInput placeholder="Search major..." />
                <ScrollArea className="h-40">
                  <CommandEmpty>No major found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {majors?.map((major) => (
                        <CommandItem
                          key={major}
                          value={major}
                          onSelect={(currentValue) => {
                            setMajorValue(currentValue)
                            setMajorOpen(false)
                          }}
                        >
                          <FaCheck
                            className={cn(
                              'mr-2 h-4 w-4',
                              majorValue === major ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {major}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Save Button */}
        <div className="mt-2 text-end">
          <Button
            disabled={updateNow ? !saveAbleUpdateNow : !saveAble}
            type="submit"
            className="font-semibold disabled:bg-neutral-300 disabled:text-neutral-500"
            onClick={onSubmitClick()}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
