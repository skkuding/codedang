'use client'

import { FeedbackInputField } from '@/components/FeedbackInputField'
import InputMessage from '@/components/InputMessage'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { baseUrl } from '@/lib/constants'
import { majors } from '@/lib/constants'
import { cn } from '@/lib/utils'
import checkIcon from '@/public/check.svg'
import useSignUpModalStore from '@/stores/signUpModal'
import { zodResolver } from '@hookform/resolvers/zod'
import { CommandList } from 'cmdk'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaCheck, FaChevronDown } from 'react-icons/fa'
import { toast } from 'sonner'
import { z } from 'zod'

export interface SignUpFormInput {
  username: string
  email: string
  verificationCode: string
  firstName: string
  lastName: string
  studentId: string
  major: string
  password: string
  passwordAgain: string
}

export const FIELD_NAMES = [
  'username',
  'password',
  'passwordAgain',
  'firstName',
  'lastName',
  'studentId',
  'major'
] as const
export type Field = (typeof FIELD_NAMES)[number]
const fields: Field[] = [...FIELD_NAMES]

const schema = z
  .object({
    username: z
      .string()
      .min(1, { message: 'Required' })
      .regex(/^[a-z0-9]{3,10}$/),
    password: z
      .string()
      .min(1, { message: 'Required' })
      .min(8)
      .max(20)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      }),
    passwordAgain: z.string().min(1, { message: 'Required' }),
    studentId: z
      .string()
      .min(1, { message: 'Required' })
      .regex(/^[0-9]{10}$/, { message: 'only 10 numbers' }),
    firstName: z
      .string()
      .min(1, { message: 'Required' })
      .regex(/^[a-zA-Z]+$/, { message: 'only English supported' }),
    lastName: z
      .string()
      .min(1, { message: 'Required' })
      .regex(/^[a-zA-Z]+$/, { message: 'only English supported' })
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
  const [majorHasBeenFocused, setMajorHasBeenFocused] = useState<boolean>(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean>(false)
  const [checkedUsername, setCheckedUsername] = useState<string>('')
  const [signUpDisable, setSignUpDisable] = useState<boolean>(false)
  const [majorOpen, setMajorOpen] = React.useState<boolean>(false)
  const [majorValue, setMajorValue] = React.useState<string>('')

  const formMethods = useForm<SignUpFormInput>({
    resolver: zodResolver(schema),
    shouldFocusError: false
  })

  const {
    handleSubmit,
    setValue,
    getValues,
    watch,
    trigger,
    formState: { errors, isDirty }
  } = formMethods

  const watchedPassword = watch('password')
  const watchedPasswordAgain = watch('passwordAgain')

  useEffect(() => {
    if (watchedPasswordAgain) {
      trigger('passwordAgain')
    }
  }, [watchedPassword, watchedPasswordAgain, trigger])

  function onSubmitClick() {
    fields.map((field) => {
      setValue(field, getValues(field), { shouldDirty: true })
      trigger(field)
    })
    setMajorHasBeenFocused(true)
  }

  const onSubmit = async (data: {
    password: string
    passwordAgain: string
    firstName: string
    lastName: string
    studentId: string
    username: string
  }) => {
    if (
      !(data.username === checkedUsername && isUsernameAvailable) ||
      !majorValue
    ) {
      return
    }
    const fullName = `${data.firstName} ${data.lastName}`
    try {
      setSignUpDisable(true)
      await fetch(baseUrl + '/user/sign-up', {
        method: 'POST',
        headers: {
          ...formData.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: data.password,
          passwordAgain: data.passwordAgain,
          realName: fullName,
          studentId: data.studentId,
          major: majorValue,
          username: data.username,
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
  const checkUserName = async () => {
    const username = getValues('username')
    await trigger('username')
    if (!errors.username) {
      try {
        await fetch(baseUrl + `/user/username-check?username=${username}`, {
          method: 'GET'
        }).then((res) => {
          setCheckedUsername(username)
          if (res.status === 200) {
            setIsUsernameAvailable(true)
          } else {
            setIsUsernameAvailable(false)
          }
        })
      } catch (err) {
        console.log(err)
      }
    }
  }

  const isRequiredError =
    errors.username && errors.username.message === 'Required'
  const isInvalidFormatError =
    errors.username && errors.username.message !== 'Required'
  const isUsernameChecked =
    checkedUsername === getValues('username') && getValues('username')
  const isAvailable =
    !errors.username && isUsernameAvailable && isUsernameChecked
  const isUnavailable =
    !errors.username && !isUsernameAvailable && isUsernameChecked
  const shouldCheckUserId =
    !isUsernameChecked && !errors.username && getValues('username')

  return (
    <div className="mb-5 mt-12 flex w-[278px] flex-col py-4">
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex justify-between gap-2">
          <FeedbackInputField
            placeholder="User ID"
            fieldName="username"
            isError={!isAvailable}
            Messages={[
              {
                type: 'error',
                text: 'Required',
                isVisible: !!isRequiredError
              },
              {
                type: 'error',
                text: '  ·  User ID used for log in\n  ·  3-10 characters of small letters, numbers',
                isVisible: !!isInvalidFormatError
              },
              {
                type: 'description',
                text: '  ·  User ID used for log in\n  ·  3-10 characters of small letters, numbers',
                isVisible: !getValues('username')
              },
              {
                type: 'error',
                text: 'This ID is already in use',
                isVisible: !!isUnavailable
              },
              {
                type: 'error',
                text: 'Check user ID',
                isVisible: !!shouldCheckUserId
              },
              {
                type: 'available',
                text: 'Available',
                isVisible: !!isAvailable
              }
            ]}
            formMethods={formMethods}
          />
          <Button
            onClick={() => {
              checkUserName()
            }}
            type="button"
            className={cn(
              ((isUsernameAvailable &&
                checkedUsername == getValues('username')) ||
                errors.username) &&
                'bg-gray-400',
              'mt-0.5 flex h-9 w-12 items-center justify-center rounded-md'
            )}
            disabled={
              (isUsernameAvailable &&
                checkedUsername == getValues('username')) ||
              errors.username
                ? true
                : false
            }
            size="icon"
          >
            <Image src={checkIcon} alt="check" />
          </Button>
        </div>
        <FeedbackInputField
          placeholder="Password"
          fieldName="password"
          isError={!!errors.password}
          Messages={[
            {
              type: 'error',
              text:
                errors.password?.message == 'Required'
                  ? 'Required'
                  : '  ·  8-20 characters\n  ·  Include two of the followings:\n     capital letters, small letters, numbers',
              isVisible: !!errors.password
            },
            {
              type: 'description',
              text: '  ·  8-20 characters\n  ·  Include two of the followings:\n     capital letters, small letters, numbers',
              isVisible: !getValues('password')
            }
          ]}
          formMethods={formMethods}
          enableShowToggle={true}
        />
        <FeedbackInputField
          placeholder="Re-enter password"
          fieldName="passwordAgain"
          isError={!!errors.passwordAgain}
          Messages={[
            {
              type: 'error',
              text: errors.passwordAgain?.message as string,
              isVisible: !!errors.passwordAgain
            }
          ]}
          formMethods={formMethods}
          enableShowToggle={true}
        />
        <div className="my-2 border-b" />
        <div className="flex justify-between gap-4">
          <FeedbackInputField
            placeholder="First name (이름)"
            fieldName="firstName"
            isError={!!errors.firstName}
            Messages={[
              {
                type: 'error',
                text: errors.firstName?.message as string,
                isVisible: !!errors.firstName
              }
            ]}
            formMethods={formMethods}
          />
          <FeedbackInputField
            placeholder="Last name (성)"
            fieldName="lastName"
            isError={!!errors.lastName}
            Messages={[
              {
                type: 'error',
                text: errors.lastName?.message as string,
                isVisible: !!errors.lastName
              }
            ]}
            formMethods={formMethods}
          />
        </div>
        <FeedbackInputField
          placeholder="Student ID (2024123456)"
          fieldName="studentId"
          isError={!!errors.studentId}
          Messages={[
            {
              type: 'error',
              text: errors.studentId?.message as string,
              isVisible: !!errors.studentId
            }
          ]}
          formMethods={formMethods}
        />
        <div className="flex flex-col gap-1">
          <Popover open={majorOpen} onOpenChange={setMajorOpen} modal={true}>
            <PopoverTrigger asChild>
              <Button
                aria-expanded={majorOpen}
                variant="outline"
                role="combobox"
                onClick={() => {
                  setMajorHasBeenFocused(true)
                }}
                className={cn(
                  'justify-between border-gray-200 font-normal text-black',
                  !majorValue
                    ? 'text-gray-500'
                    : 'ring-primary border-0 ring-1',
                  !majorValue &&
                    majorHasBeenFocused &&
                    !majorOpen &&
                    'border-0 ring-1 ring-red-500'
                )}
              >
                <p className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {!majorValue ? 'First Major' : majorValue}
                </p>
                <FaChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
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
                          <p className="w-[230px] overflow-hidden text-ellipsis whitespace-nowrap">
                            {major}
                          </p>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </ScrollArea>
              </Command>
            </PopoverContent>
          </Popover>
          {!majorValue &&
            majorHasBeenFocused &&
            !majorOpen &&
            InputMessage('Required')}
        </div>

        <Button
          disabled={signUpDisable || !isDirty}
          type="submit"
          onClick={onSubmitClick}
        >
          Register
        </Button>
      </form>
    </div>
  )
}
