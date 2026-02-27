'use client'

import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { safeFetcher } from '@/libs/utils'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
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

const schema = (t: (key: string) => string) =>
  v.object({
    username: v.pipe(
      v.string(),
      v.minLength(3, t('username_must_be_at_least_3_characters')),
      v.maxLength(10, t('username_must_be_at_most_10_characters')),
      v.regex(
        /^[a-z0-9]+$/,
        t('username_must_contain_only_lowercase_letters_and_numbers')
      )
    ),
    password: v.pipe(
      v.string(),
      v.minLength(8, t('password_must_be_at_least_8_characters')),
      v.maxLength(20, t('password_must_be_at_most_20_characters')),
      v.regex(
        /^(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[A-Z])(?=.*\d)/,
        t('password_must_use_2_of_uppercase_lowercase_number')
      )
    ),
    passwordConfirm: v.pipe(
      v.string(),
      v.minLength(8, t('password_must_be_at_least_8_characters')),
      v.maxLength(20, t('password_must_be_at_most_20_characters'))
    )
  })

function RegisterAccountForm({ children }: { children: ReactNode }) {
  const { t } = useTranslate()
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const methods = useForm<RegisterAccountInput>({
    resolver: valibotResolver(schema(t)),
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
  const { t } = useTranslate()
  return (
    <button
      className="absolute inset-y-0 right-[21.67px] flex items-center"
      type="button"
      tabIndex={-1}
      onClick={() => setIsVisible(!isVisible)}
      aria-label={isVisible ? t('hide_password') : t('show_password')}
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
  const { t } = useTranslate()
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
  const [isPasswordConfirmVisible, setIsPasswordConfirmVisible] =
    useState(false)
  const watchUsername = watch('username')
  const watchPassword = watch('password')
  const watchPasswordConfirm = watch('passwordConfirm')

  const isPasswordMatched =
    watchPassword === watchPasswordConfirm && watchPasswordConfirm.length > 0

  return (
    <>
      <div>
        <p className="mb-[30px] text-xl font-medium">
          {t('create_your_account')}
        </p>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[6px]">
            <IDLabel />
            <div className="flex gap-1">
              <div className="w-full">
                <Input
                  placeholder={t('username_placeholder')}
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
                      <AuthMessage
                        message={t('available_id')}
                        type={'success'}
                      />
                    )
                  }
                  return (
                    <AuthMessage message={t('username_info')} type={'info'} />
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
                      message: t('duplicate_id')
                    })
                  }
                }}
              >
                {t('check_button')}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-[6px]">
            <PasswordLabel />
            <div className="relative">
              <Input
                placeholder={t('password_placeholder')}
                type={isPasswordVisible ? 'text' : 'password'}
                {...register('password')}
                onFocus={() => {
                  trigger('password')
                }}
              />
              <VisibleButton
                isVisible={isPasswordVisible}
                setIsVisible={setIsPasswordVisible}
              />
            </div>
            {(() => {
              if (errors.password) {
                return (
                  <AuthMessage
                    message={errors.password.message?.toString() ?? ''}
                    type="error"
                  />
                )
              }
              if (!errors.password && watchPassword) {
                return (
                  <AuthMessage message={t('correct_password')} type="success" />
                )
              }
              return <AuthMessage message={t('password_info')} type="info" />
            })()}
            <div className="relative">
              <Input
                placeholder={t('reenter_password_placeholder')}
                type={isPasswordConfirmVisible ? 'text' : 'password'}
                {...register('passwordConfirm')}
                onFocus={() => {
                  trigger('password')
                }}
              />
              <VisibleButton
                isVisible={isPasswordConfirmVisible}
                setIsVisible={setIsPasswordConfirmVisible}
              />
            </div>
            {watchPasswordConfirm &&
              (isPasswordMatched ? (
                <AuthMessage message={t('passwords_match')} type="success" />
              ) : (
                <AuthMessage
                  message={t('passwords_do_not_match')}
                  type="error"
                />
              ))}
          </div>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full px-[22px] py-[9px] text-base font-medium"
        disabled={!isUsernameAvailable || !isValid || !isPasswordMatched}
      >
        {t('next_button')}
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
