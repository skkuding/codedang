'use client'

import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn, isHttpError, safeFetcher } from '@/libs/utils'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { IoWarningOutline } from 'react-icons/io5'
import * as v from 'valibot'
import { IDLabel, PasswordLabel } from '../AuthLabel'

interface SignUpFormInput {
  username: string
  email: string
  verificationCode: string
  password: string
  passwordAgain: string
}

const FIELD_NAMES = ['username', 'password', 'passwordAgain'] as const
type Field = (typeof FIELD_NAMES)[number]
const fields: Field[] = [...FIELD_NAMES]

const schema = v.pipe(
  v.object({
    username: v.pipe(
      v.string(),
      v.minLength(1, 'Required'),
      v.regex(/^[a-z0-9]{3,10}$/)
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8, 'Required'),
      v.maxLength(20),
      v.check((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      })
    ),
    passwordAgain: v.pipe(v.string(), v.minLength(1, 'Required'))
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['passwordAgain']],
      (input) => input.password === input.passwordAgain,
      'Incorrect'
    ),
    ['passwordAgain']
  )
)

export function requiredMessage(message?: string) {
  return (
    <div className="inline-flex items-center text-xs text-red-500">
      {message === 'Required' && <IoWarningOutline />}
      <p className={cn(message === 'Required' && 'pl-1')}>{message}</p>
    </div>
  )
}

export function SignUpRegisterAccount() {
  const {
    handleSubmit,
    register,
    getValues,
    watch,
    trigger,
    formState: { errors, isDirty }
  } = useForm<SignUpFormInput>({
    resolver: valibotResolver(schema),
    defaultValues: {
      username: '',
      password: ''
    },
    shouldFocusError: false
  })
  const formData = useSignUpModalStore((state) => state.formData)
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)
  const [inputFocus, setInputFocus] = useState<number>(0)
  const [focusedList, setFocusedList] = useState<Array<boolean>>([
    true,
    ...Array(7).fill(false)
  ])
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean>(false)
  const [checkedUsername, setCheckedUsername] = useState<string>('')
  const [signUpDisable, setSignUpDisable] = useState<boolean>(false)

  const watchedPassword = watch('password')
  const watchedPasswordAgain = watch('passwordAgain')

  useEffect(() => {
    if (watchedPasswordAgain) {
      trigger('passwordAgain')
    }
  }, [watchedPassword, watchedPasswordAgain, trigger])

  const updateFocus = (n: number) => {
    setInputFocus(n)
    setFocusedList((prevList) =>
      prevList.map((focused, index) => (index === n ? true : focused))
    )
    if (n > 0) {
      trigger(fields[n - 1])
    }
  }

  const onSubmitClick = () => {
    setInputFocus(0)
    setFocusedList(Array(8).fill(true))
    fields.map((field) => {
      trigger(field)
    })
  }

  const onSubmit = (data: {
    password: string
    passwordAgain: string
    username: string
  }) => {
    if (!(data.username === checkedUsername && isUsernameAvailable)) {
      return
    }
  }
  const validation = async (field: string) => {
    await trigger(field as keyof SignUpFormInput)
  }

  const checkUserName = async () => {
    const username = getValues('username')
    await trigger('username')

    if (errors.username) {
      updateFocus(0)
      return
    }

    try {
      await safeFetcher.get(`user/username-check?username=${username}`)
      setCheckedUsername(username)
      setIsUsernameAvailable(true)
    } catch (error) {
      if (isHttpError(error)) {
        setCheckedUsername(username)
        setIsUsernameAvailable(false)
      }
    }
  }
  const getInputBorderClassname = (
    isFocus: boolean,
    error: boolean,
    value: string
  ) => {
    let className = 'border-primary'

    if (error && (value || !isFocus)) {
      className = 'border-red-500 focus-visible:border-red-500'
    }

    return className
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
    <form
      className="flex h-full flex-col justify-between"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        <p className="mb-[30px] text-xl font-medium">Create Your Account</p>
        <div className="flex flex-col gap-1">
          <IDLabel />
          <div className="flex items-center gap-1">
            <Input
              placeholder="User ID"
              type="text"
              {...register('username')}
              className={cn(
                'focus-visible:ring-1',
                watch('username') && 'ring-primary ring-1'
              )}
            />
            <Input
              placeholder="User ID"
              className={cn(
                'focus-visible:ring-0',
                focusedList[1] &&
                  getInputBorderClassname(
                    inputFocus === 1,
                    Boolean(errors.username),
                    getValues('username')
                  ),
                !isUsernameAvailable &&
                  getValues('username') &&
                  (checkedUsername === getValues('username') ||
                    inputFocus !== 1) &&
                  'border-red-500 focus-visible:border-red-500'
              )}
              {...register('username', {
                onChange: () => {
                  validation('username')
                  setIsUsernameAvailable(false)
                },
                validate: (value) =>
                  value === checkedUsername && isUsernameAvailable
                    ? true
                    : 'Check user ID'
              })}
              onFocus={() => {
                trigger('username')
                updateFocus(1)
              }}
            />
            <Button
              onClick={checkUserName}
              type="button"
              variant={'outline'}
              className={cn(
                ((isUsernameAvailable &&
                  checkedUsername === getValues('username')) ||
                  errors.username) &&
                  'bg-gray-400',
                'flex h-8 w-11 items-center justify-center rounded-full'
              )}
              disabled={Boolean(
                (isUsernameAvailable &&
                  checkedUsername === getValues('username')) ||
                  errors.username
              )}
              size="icon"
            >
              Check
            </Button>
          </div>
          <div className="text-xs">
            {inputFocus !== 1 && (
              <>
                {isRequiredError && requiredMessage('Required')}
                {isInvalidFormatError && (
                  <ul className="list-disc pl-4 text-red-500">
                    <li>User ID used for log in</li>
                    <li>3-10 characters of small letters, numbers</li>
                  </ul>
                )}
                {isAvailable && (
                  <p className="text-xs text-blue-500">Available</p>
                )}
                {isUnavailable && (
                  <p className="text-red-500">This ID is already in use</p>
                )}
                {shouldCheckUserId && (
                  <p className="text-red-500">Check user ID</p>
                )}
              </>
            )}
            {inputFocus === 1 &&
              (!isUsernameAvailable &&
              checkedUsername === getValues('username') &&
              getValues('username') ? (
                <p className="text-red-500">This ID is already in use</p>
              ) : (
                <div
                  className={cn(
                    errors.username && getValues('username')
                      ? 'text-red-500'
                      : 'text-gray-700'
                  )}
                >
                  <ul className="list-disc pl-4">
                    <li>User ID used for log in</li>
                    <li>3-10 characters of small letters, numbers</li>
                  </ul>
                </div>
              ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <PasswordLabel />
          <div className="relative flex justify-between gap-2">
            <Input
              placeholder="Password"
              className={cn(
                'focus-visible:ring-0',
                focusedList[2] &&
                  getInputBorderClassname(
                    inputFocus === 2,
                    Boolean(errors.password),
                    getValues('password')
                  )
              )}
              {...register('password', {
                onChange: () => validation('password')
              })}
              type={passwordShow ? 'text' : 'password'}
              onFocus={() => {
                updateFocus(2)
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
          {inputFocus === 2 &&
            (errors.password || !getValues('password') ? (
              <div
                className={cn(
                  !getValues('password') ? 'text-gray-700' : 'text-red-500'
                )}
              >
                <ul className="pl-4 text-xs">
                  <li className="list-disc">8-20 characters</li>
                  <li className="list-disc">Include two of the followings:</li>
                  <li>capital letters, small letters, numbers</li>
                </ul>
              </div>
            ) : (
              <p className="text-xs text-blue-500">Available</p>
            ))}
          {inputFocus !== 2 &&
            errors.password &&
            (errors.password.message === 'Required' ? (
              requiredMessage('Required')
            ) : (
              <ul className="pl-4 text-xs text-red-500">
                <li className="list-disc">8-20 characters</li>
                <li className="list-disc">Include two of the followings:</li>
                <li>capital letters, small letters, numbers</li>
              </ul>
            ))}
        </div>
        <div className="flex flex-col gap-1">
          <div className="relative flex justify-between gap-2">
            <Input
              {...register('passwordAgain', {
                onChange: () => validation('passwordAgain')
              })}
              className={cn(
                'focus-visible:ring-0',
                focusedList[3] &&
                  getInputBorderClassname(
                    inputFocus === 3,
                    Boolean(errors.passwordAgain),
                    getValues('passwordAgain')
                  )
              )}
              placeholder="Re-enter password"
              type={passwordAgainShow ? 'text' : 'password'}
              onFocus={() => {
                updateFocus(3)
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
          {errors.passwordAgain &&
            (getValues('passwordAgain') || inputFocus !== 3) &&
            requiredMessage(errors.passwordAgain.message)}
        </div>
      </div>

      <Button
        disabled={signUpDisable || !isDirty}
        type="submit"
        onClick={onSubmitClick}
      >
        Next
      </Button>
    </form>
  )
}
