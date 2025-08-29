'use client'

import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { safeFetcher } from '@/libs/utils'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useState, type ReactNode } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import * as v from 'valibot'
import { IDLabel, PasswordLabel } from '../AuthLabel'
import { AuthMessage } from '../AuthMessage'

interface RegisterAccountInput {
  username: string
  password: string
  passwordConfirm: string
}

const schema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3, 'Username must be at least 3 characters'),
    v.maxLength(10, 'Username must be at most 10 characters'),
    v.regex(
      /^[a-z0-9]+$/,
      'Username must contain only lowercase letters and numbers'
    )
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'Password must be at least 8 characters'),
    v.maxLength(20, 'Password must be at most 20 characters'),
    v.regex(
      /^(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[A-Z])(?=.*\d)/,
      'Password must use 2 of: uppercase, lowercase, number'
    )
  ),
  passwordConfirm: v.pipe(
    v.string(),
    v.minLength(8, 'Password must be at least 8 characters'),
    v.maxLength(20, 'Password must be at most 20 characters')
  )
})

function RegisterAccountForm({ children }: { children: ReactNode }) {
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const methods = useForm<RegisterAccountInput>({
    resolver: valibotResolver(schema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
      passwordConfirm: ''
    }
  })

  const onSubmit = (data: RegisterAccountInput) => {
    setFormData({
      ...formData,
      ...data
    })
    nextModal()
  }

  return (
    <form
      className="flex h-full flex-col justify-between"
      onSubmit={methods.handleSubmit(onSubmit)}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </form>
  )
}

interface VisibleButtonProps {
  isVisible: boolean
  setIsVisible: (visible: boolean) => void
}

function VisibleButton({ isVisible, setIsVisible }: VisibleButtonProps) {
  return (
    <button
      className="absolute inset-y-0 right-[21.67px] flex items-center"
      type="button"
      onClick={() => setIsVisible(!isVisible)}
    >
      {isVisible ? (
        <FaEye className="text-gray-400" />
      ) : (
        <FaEyeSlash className="text-gray-400" />
      )}
    </button>
  )
}

function SignUpRegisterAccountContent() {
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false)
  const {
    register,
    watch,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isValid }
  } = useFormContext<RegisterAccountInput>()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const watchUsername = watch('username')
  const watchPassword = watch('password')
  const watchPasswordConfirm = watch('passwordConfirm')

  const isPasswordMatched =
    watchPassword === watchPasswordConfirm && watchPasswordConfirm.length > 0

  return (
    <>
      <div>
        <p className="mb-[30px] text-xl font-medium">Create Your Account</p>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[6px]">
            <IDLabel />
            <div className="flex gap-1">
              <div className="w-full">
                <Input
                  placeholder="username"
                  {...register('username')}
                  onFocus={() => {
                    clearErrors('username')
                    setIsUsernameAvailable(false)
                  }}
                />
                {(() => {
                  if (errors['username']) {
                    return (
                      <AuthMessage
                        message={errors['username'].message?.toString() ?? ''}
                        type={'error'}
                      />
                    )
                  }
                  if (isUsernameAvailable) {
                    return (
                      <AuthMessage message={'Available ID'} type={'success'} />
                    )
                  }
                  return (
                    <AuthMessage
                      message={'3-10 characters of small letters, numbers'}
                      type={'info'}
                    />
                  )
                })()}
              </div>
              <Button
                type="button"
                variant={'outline'}
                className="w-[89px]"
                disabled={watchUsername?.length === 0}
                onClick={async () => {
                  const valid = await trigger('username')
                  if (!valid) {
                    return
                  }
                  try {
                    await safeFetcher.get(
                      `user/username-check?username=${watchUsername}`
                    )
                    clearErrors('username')
                    setIsUsernameAvailable(true)
                  } catch {
                    setError('username', {
                      message: 'Duplicate ID'
                    })
                  }
                }}
              >
                Check
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-[6px]">
            <PasswordLabel />
            <div className="relative">
              <Input
                placeholder="Password"
                type={isPasswordVisible ? 'text' : 'password'}
                {...register('password')}
                onFocus={() => {
                  clearErrors('password')
                  setIsPasswordFocused(true)
                }}
                onBlur={() => {
                  setIsPasswordFocused(false)
                }}
              />
              <VisibleButton
                isVisible={isPasswordVisible}
                setIsVisible={setIsPasswordVisible}
              />
            </div>
            {isPasswordFocused &&
              (() => {
                if (errors.password) {
                  return (
                    <AuthMessage
                      message={errors.password.message?.toString() ?? ''}
                      type="error"
                    />
                  )
                }
                // valibot 검증이 통과하고 실제 비밀번호가 입력된 경우만 success 표시
                if (!errors.password && watchPassword) {
                  return (
                    <AuthMessage message="Correct Password" type="success" />
                  )
                }
                return (
                  <AuthMessage
                    message="8–20 characters, use 2 of: upper, lower, number"
                    type="info"
                  />
                )
              })()}
            <div className="relative">
              <Input
                placeholder="Re-enter Password"
                type={isPasswordVisible ? 'text' : 'password'}
                {...register('passwordConfirm')}
                onFocus={() => clearErrors('passwordConfirm')}
              />
              <VisibleButton
                isVisible={isPasswordVisible}
                setIsVisible={setIsPasswordVisible}
              />
            </div>
            {watchPasswordConfirm &&
              (isPasswordMatched ? (
                <AuthMessage message="Passwords match" type="success" />
              ) : (
                <AuthMessage message="Passwords do not match" type="error" />
              ))}
          </div>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full px-[22px] py-[9px] text-base font-medium"
        disabled={!isUsernameAvailable || !isValid || !isPasswordMatched}
      >
        Next
      </Button>
    </>
  )
}

export function SignUpRegisterAccount() {
  return (
    <RegisterAccountForm>
      <SignUpRegisterAccountContent />
    </RegisterAccountForm>
  )
}
