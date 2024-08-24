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
// import { baseUrl } from '@/lib/constants'
import { cn, safeFetcherWithAuth } from '@/lib/utils'
import invisible from '@/public/24_invisible.svg'
import visible from '@/public/24_visible.svg'
import codedangSymbol from '@/public/codedang-editor.svg'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaCheck, FaChevronDown } from 'react-icons/fa6'
import { toast } from 'sonner'
// import { IoWarningOutline } from 'react-icons/io5'
import { z } from 'zod'

interface SettingsFormat {
  username: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  realName: string
  major: string
  studentId: string
}

// 선택적인 필드만 포함된 타입 정의
type UpdatePayload = Partial<{
  studentId: string
  password: string
  newPassword: string
  realName: string
  major: string
}>

const majors = [
  '학과 정보 없음',
  '자유전공계열',
  '인문과학계열',
  '유학·동양학과',
  '국어국문학과',
  '영어영문학과',
  '프랑스어문학과',
  '중어중문학과',
  '독어독문학과',
  '러시아어문학과',
  '한문학과',
  '사학과',
  '철학과',
  '문헌정보학과',
  '사회과학계열',
  '행정학과',
  '정치외교학과',
  '미디어커뮤니케이션학과',
  '사회학과',
  '사회복지학과',
  '심리학과',
  '소비자학과',
  '아동·청소년학과',
  '경제학과',
  '통계학과',
  '경영학과',
  '글로벌리더학부',
  '글로벌경제학과',
  '글로벌경영학과',
  '교육학과',
  '한문교육과',
  '영상학과',
  '의상학과',
  '자연과학계열',
  '생명과학과',
  '수학과',
  '물리학과',
  '화학과',
  '식품생명공학과',
  '바이오메카트로닉스학과',
  '융합생명공학과',
  '전자전기공학부',
  '공학계열',
  '화학공학/고분자공학부',
  '신소재공학부',
  '기계공학부',
  '건설환경공학부',
  '시스템경영공학과',
  '나노공학과',
  '소프트웨어학과',
  '반도체시스템공학과',
  '지능형소프트웨어학과',
  '글로벌바이오메디컬공학과',
  '반도체융합공학과',
  '에너지학과',
  '양자정보공학과',
  '건축학과',
  '소재부품융합공학과',
  '약학과',
  '의예과',
  '수학교육과',
  '컴퓨터교육과',
  '글로벌융합학부',
  '데이터사이언스융합전공',
  '인공지능융합전공',
  '컬처앤테크놀로지융합전공',
  '자기설계융합전공',
  '연기예술학과',
  '무용학과',
  '미술학과',
  '디자인학과',
  '스포츠과학과'
]

const schema = z
  .object({
    // currentPassword: z.string().min(1, { message: 'Required' }),
    currentPassword: z.string().min(1, { message: 'Required' }),
    // .min(8)
    // .max(20)
    // .refine((data) => {
    //   const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
    //   return !invalidPassword.test(data)
    // }),
    // newPassword: z.string().min(8, { message: 'Password must be at least 8 characters' }).optional(),
    newPassword: z
      .string()
      .min(1)
      .min(8)
      .max(20)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      }),
    // confirmPassword: z.string().optional(),
    confirmPassword: z.string().min(1),
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
    <div className="-mt-4 inline-flex items-center text-xs text-red-500">
      {message}
    </div>
  )
}

export default function Page() {
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<SettingsFormat>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      realName: '',
      major: ''
    }
  })

  // Check if Current Password is correct
  const [isCheckButtonClicked, setIsCheckButtonClicked] =
    useState<boolean>(false)
  const [isPasswordCorrect, setIsPasswordCorrect] = useState<boolean>(false)
  const [newPasswordAble, setNewPasswordAble] = useState<boolean>(false)
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [newPasswordShow, setNewPasswordShow] = useState<boolean>(false)
  const [confirmPasswordShow, setConfirmPasswordShow] = useState<boolean>(false)
  // const [passwordConfirmed, setPasswordConfirmed] = useState<boolean>(false)
  const [majorOpen, setMajorOpen] = useState<boolean>(false)
  const [majorValue, setMajorValue] = useState<string>('')
  const [saveDisable, setSaveDisable] = useState<boolean>(true)

  const currentPassword = watch('currentPassword')
  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')
  const realName = watch('realName')
  const isPasswordsMatch = newPassword === confirmPassword && newPassword !== ''

  // New Password Input 창과 Re-enter Password Input 창의 border 색상을 일치하는지 여부에 따라 바꿈
  useEffect(() => {
    if (isPasswordsMatch) {
      setValue('newPassword', newPassword)
      setValue('confirmPassword', confirmPassword)
    }
  }, [isPasswordsMatch, newPassword, confirmPassword])

  // Save Button 활성화 조건을 관리하기 위해 useEffect를 추가
  useEffect(() => {
    if (isPasswordCorrect && isPasswordsMatch && realName) {
      setSaveDisable(false) // 조건이 모두 만족되면 Save 버튼 활성화
    } else {
      setSaveDisable(true) // 조건이 하나라도 불만족 시 Save 버튼 비활성화
    }
  }, [isPasswordCorrect, isPasswordsMatch, realName])

  // API로 변경된 정보 전송
  const onSubmit = async (data: SettingsFormat) => {
    console.log('실행됨')
    if (!isPasswordsMatch) {
      return
    }

    try {
      setSaveDisable(true)

      // 필요 없는 필드 제외
      const updatePayload: UpdatePayload = {}
      if (data.studentId || data.studentId !== '') {
        updatePayload.studentId = data.studentId
      }
      if (data.currentPassword || data.currentPassword !== '') {
        updatePayload.password = data.currentPassword
      }
      if (data.newPassword || data.newPassword !== '') {
        updatePayload.newPassword = data.newPassword
      }
      if (data.realName || data.realName !== '') {
        updatePayload.realName = data.realName
      }
      if (data.major || data.major !== '') {
        updatePayload.major = data.major
      }

      const response = await safeFetcherWithAuth.patch('user', {
        json: updatePayload
      })

      if (response.ok) {
        toast.success('Successfully updated your information')
      }
    } catch (error) {
      toast.error('Failed to update your information')
      setSaveDisable(false)
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
          You can change your information
        </p>

        {/* ID */}
        {/* 해야 할 일 : Input placeholder만 api 활용하여 넣기 */}
        <label className="-mb-4 text-xs">ID</label>
        <Input
          placeholder="user01"
          {...register('username')}
          disabled={true}
          className="border-neutral-300 text-neutral-600 placeholder:text-neutral-400 disabled:bg-neutral-200"
        />

        {/* Current password */}
        {/* 해야 할 일 : API 연결해서 입력값이랑 기존password값 비교하는 로직 */}
        <label className="-mb-4 mt-4 text-xs">Password</label>
        <div className="flex items-center gap-2">
          <div className="relative w-full justify-between">
            <Input
              type={passwordShow ? 'text' : 'password'}
              placeholder="Current password"
              {...register('currentPassword')}
              disabled={isCheckButtonClicked && isPasswordCorrect}
              className={`flex justify-stretch text-neutral-600 placeholder:text-neutral-300 disabled:text-neutral-400 ${errors.currentPassword && 'border-red-500'} ${isCheckButtonClicked ? (isPasswordCorrect ? 'border-primary' : 'border-red-500') : ''} ring-0 focus-visible:ring-0`}
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
            // password가 맞는지 확인하는 함수 (isPasswordCorrect조절)
            onClick={() => {
              // 현재 무조건 true로 설정
              setIsPasswordCorrect(true)
              setIsCheckButtonClicked(true)
              setNewPasswordAble(true)
            }}
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
        {/* 해야 할 일 : API 연결작업 */}
        <div className="flex items-center gap-2">
          <div className="relative w-full justify-between">
            <Input
              type={newPasswordShow ? 'text' : 'password'}
              placeholder="New password"
              disabled={!newPasswordAble}
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
        {errors.newPassword && (
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
        {/* 해야 할 일 : API 연결작업 */}
        <div className="flex items-center gap-2">
          <div className="relative w-full justify-between">
            <Input
              type={confirmPasswordShow ? 'text' : 'password'}
              placeholder="Re-enter new password"
              disabled={!newPasswordAble}
              {...register('confirmPassword', {
                validate: (val: string) => {
                  if (watch('newPassword') != val) {
                    return 'Incorrect'
                  }
                  // setPasswordConfirmed(true)
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
        {/* 해야 할 일 : API 연결작업 */}
        <label className="-mb-4 text-xs">Name</label>
        <Input
          placeholder="홍길동"
          {...register('realName')}
          className={`${realName && 'border-primary'} placeholder:text-neutral-300 focus-visible:ring-0`}
        />

        {/* Student ID */}
        {/* 수정불가 */}
        <label className="-mb-4 mt-2 text-xs">Student ID</label>
        <Input
          placeholder="홍길동의 ID"
          disabled={true}
          {...register('studentId')}
          className="border-neutral-300 text-neutral-600 placeholder:text-neutral-400 disabled:bg-neutral-200"
        />

        {/* First Major */}
        {/* 해야 할 일 : API 연결작업 */}
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
                  !majorValue ? 'text-neutral-300' : 'border-primary'
                )}
              >
                {!majorValue ? '원래 전공' : majorValue}
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
            // 변동 사항이 존재하고, 모든 입력 사항이 입력 조건에 맞을 때 활성화
            disabled={!isDirty && saveDisable}
            type="submit"
            className="font-semibold disabled:bg-neutral-300 disabled:text-neutral-500"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
