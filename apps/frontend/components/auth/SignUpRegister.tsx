'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { baseUrl } from '@/lib/constants'
import { cn } from '@/lib/utils'
import useSignUpModalStore from '@/stores/signUpModal'
import { zodResolver } from '@hookform/resolvers/zod'
import { CommandList } from 'cmdk'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaCheck, FaChevronDown, FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'sonner'
import { z } from 'zod'

interface SignUpFormInput {
  username: string
  email: string
  verificationCode: string
  firstName: string
  lastName: string
  studentId: string
  department: string
  password: string
  passwordAgain: string
}

const departments = [
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
  '행정학과',
  '정치외교학과',
  '미디어커뮤니케이션학과',
  '사회학과',
  '사회복지학과',
  '심리학과',
  '소비자학과',
  '아동·청소년학과',
  '글로벌리더학부',
  '경제학과',
  '통계학과',
  '글로벌경제학과',
  '경영학과',
  '글로벌경영학과',
  '교육학과',
  '한문교육과',
  '수학교육과',
  '컴퓨터교육과',
  '미술학과',
  '디자인학과',
  '무용학과',
  '영상학과',
  '연기예술학과',
  '의상학과',
  '생명과학과',
  '수학과',
  '물리학과',
  '화학과',
  '전자전기공학부',
  '반도체시스템공학과',
  '소재부품융합공학과',
  '소프트웨어학과',
  '글로벌융합학부(데이터사이언스융합전공, 인공지능융합전공, 컬처앤테크놀로지융합전공, 자기설계융합전공)',
  '화학공학/고분자공학부',
  '신소재공학부',
  '기계공학부',
  '건설환경공학부',
  '시스템경영공학과',
  '나노공학과',
  '건축학과',
  '약학과',
  '식품생명공학과',
  '바이오메카트로닉스학과',
  '융합생명공학과',
  '스포츠과학과',
  '의예과',
  '의학과',
  '글로벌바이오메디컬공학과'
]

const schema = z
  .object({
    username: z
      .string()
      .min(3)
      .max(10)
      .refine((data) => /^[a-z0-9]+$/.test(data)),
    password: z
      .string()
      .min(8)
      .max(20)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      }),
    passwordAgain: z.string(),
    studentId: z
      .string()
      .max(10)
      .regex(new RegExp(/[0-9]{10}/)),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
  })
  .refine(
    (data: { password: string; passwordAgain: string }) =>
      data.password === data.passwordAgain,
    {
      message: 'Incorrect',
      path: ['passwordAgain']
    }
  )

export default function SignUpRegister() {
  const formData = useSignUpModalStore((state) => state.formData)
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)
  const [inputFocus, setInputFocus] = useState<number>(0)
  const [disableUsername, setDisableUsername] = useState<boolean>(false)
  const [usernameVerify, setUsernameVerify] = useState<boolean>(false)
  const [signUpDisable, setSignUpDisable] = useState<boolean>(false)

  const [departmentOpen, setDepartmentOpen] = React.useState<boolean>(false)
  const [departmentValue, setDepartmentValue] = React.useState<string>('')

  const {
    handleSubmit,
    register,
    getValues,
    watch,
    trigger,
    formState: { errors, isValid }
  } = useForm<SignUpFormInput>({
    resolver: zodResolver(schema)
  })

  const watchedPassword = watch('password')

  useEffect(() => {
    trigger('passwordAgain')
  }, [watchedPassword, trigger])

  const onSubmit = async (data: {
    password: string
    passwordAgain: string
    firstName: string
    lastName: string
    studentId: string
    department: string
    username: string
  }) => {
    try {
      setSignUpDisable(true)
      await fetch(baseUrl + '/user/sign-up', {
        method: 'POST',
        headers: {
          ...formData.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          email: formData.email,
          verificationCode: formData.verificationCode
        })
      }).then((res) => {
        if (res.status === 201) {
          document.getElementById('closeDialog')?.click()
          toast.success('Sign up succeeded!')
        }
      })
    } catch {
      toast.error('Sign up failed!')
      setSignUpDisable(false)
    }
  }
  const validation = async (field: string) => {
    await trigger(field as keyof SignUpFormInput)
  }

  const checkUserName = async () => {
    const { username } = getValues()
    await trigger('username')
    if (!errors.username) {
      try {
        await fetch(baseUrl + `/user/username-check?username=${username}`, {
          method: 'GET'
        }).then((res) => {
          setUsernameVerify(true)
          if (res.status === 200) {
            setDisableUsername(true)
          } else {
            setDisableUsername(false)
          }
        })
      } catch (err) {
        console.log(err)
      }
    }
  }

  return (
    <div className="mb-5 mt-12 flex w-full flex-col px-2 py-4">
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <Input
              placeholder="User ID"
              disabled={disableUsername}
              {...register('username', {
                onChange: () => validation('username')
              })}
              onFocus={() => {
                setInputFocus(2)
              }}
            />
            <Button
              onClick={() => checkUserName()}
              type="button"
              className={cn(
                disableUsername && 'bg-gray-400',
                'flex aspect-square w-12 items-center justify-center rounded-md'
              )}
              disabled={disableUsername}
            >
              <FaCheck className="text-white" size="20" />
            </Button>
          </div>
          {inputFocus === 2 && (
            <div className="text-xs text-gray-500">
              <ul className="list-disc pl-4">
                <li>User ID used for log in</li>
                <li>3-10 characters of small letters, numbers</li>
              </ul>
            </div>
          )}
          {errors.username ? (
            <p className="text-xs text-red-500">Unavailable</p>
          ) : (
            usernameVerify &&
            (disableUsername ? (
              <p className="text-xs text-blue-500">Available</p>
            ) : (
              <p className="text-xs text-red-500">Unavailable</p>
            ))
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="relative flex justify-between gap-2">
            <Input
              placeholder="Password"
              {...register('password', {
                onChange: () => validation('password')
              })}
              type={passwordShow ? 'text' : 'password'}
              onFocus={() => {
                setInputFocus(3)
              }}
            />
            <span
              className="absolute right-0 top-0 flex h-full p-3"
              onClick={() => setPasswordShow(!passwordShow)}
            >
              {passwordShow ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </span>
          </div>
          {(inputFocus === 3 || errors.password) && (
            <div
              className={cn(
                errors.password ? 'text-red-500' : 'text-gray-500',
                'text-xs'
              )}
            >
              <ul className="pl-4">
                <li className="list-disc">8-20 characters</li>
                <li className="list-disc">Include two of the followings:</li>
                <li>capital letters, small letters, numbers</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="relative flex justify-between gap-2">
            <Input
              {...register('passwordAgain', {
                onChange: () => validation('passwordAgain')
              })}
              placeholder="Re-enter password"
              type={passwordAgainShow ? 'text' : 'password'}
              onFocus={() => {
                setInputFocus(4)
              }}
            />
            <span
              className="absolute right-0 top-0 flex h-full p-3"
              onClick={() => setPasswordAgainShow(!passwordAgainShow)}
            >
              {passwordAgainShow ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </span>
          </div>
          {errors.passwordAgain && (
            <p className="text-xs text-red-500">
              {errors.passwordAgain.message}
            </p>
          )}
        </div>
        <div className="border-b" />
        <div className="flex justify-between gap-4">
          <Input
            placeholder="First name (이름)"
            {...register('firstName', {
              onChange: () => validation('firstName')
            })}
            onFocus={() => {
              setInputFocus(1)
            }}
          />
          <Input
            placeholder="Last name (성)"
            {...register('lastName', {
              onChange: () => validation('lastName')
            })}
            onFocus={() => {
              setInputFocus(1)
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Input
            placeholder="Student ID (2024123456)"
            {...register('studentId', {
              onChange: () => validation('studentId')
            })}
            onFocus={() => {
              setInputFocus(1)
            }}
          />

          {errors.studentId && (
            <p className="text-xs text-red-500">only 10 numbers</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Popover
            open={departmentOpen}
            onOpenChange={setDepartmentOpen}
            modal={true}
          >
            <PopoverTrigger asChild>
              <Button
                aria-expanded={departmentOpen}
                variant="outline"
                role="combobox"
                className="justify-between"
              >
                {departmentValue == '' ? 'First Major' : departmentValue}
                <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <Command>
                <CommandInput placeholder="Search department..." />
                <ScrollArea className="h-40">
                  <CommandEmpty>No department found.</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {departments?.map((department) => (
                        <CommandItem
                          key={department}
                          value={department}
                          onSelect={(currentValue) => {
                            setDepartmentValue(
                              currentValue === departmentValue
                                ? ''
                                : currentValue
                            )
                            setDepartmentOpen(false)
                          }}
                        >
                          <FaCheck
                            className={cn(
                              'mr-2 h-4 w-4',
                              departmentValue === department
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          {department}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          disabled={
            !isValid ||
            !disableUsername ||
            signUpDisable ||
            departmentValue == ''
          }
          className={cn(
            isValid && disableUsername && departmentValue != ''
              ? ''
              : 'bg-gray-400'
          )}
          type="submit"
        >
          Register
        </Button>
      </form>
    </div>
  )
}
