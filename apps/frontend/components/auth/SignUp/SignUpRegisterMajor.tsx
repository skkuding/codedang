'use client'

import { InputForm } from '@/app/admin/course/_components/InputForm'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import * as v from 'valibot'
import { IDLabel, PasswordLabel } from '../AuthLabel'

interface RegisterAccountInput {
  username: string
  password: string
  passwordConfirm: string
}

const schema = v.object({
  password: v.pipe(v.string(), v.length(6, 'Code must be 6 characters long')),
  passwordConfirm: v.pipe(
    v.string(),
    v.length(6, 'Code must be 6 characters long')
  )
})

function RegisterAccountForm({ children }: { children: ReactNode }) {
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const methods = useForm<RegisterAccountInput>({
    resolver: valibotResolver(schema),
    defaultValues: {
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

interface RegisterAccountFormFieldsProps {
  setIsButtonDisabled: (isDisabled: boolean) => void
}

function RegisterAccountFormFields({
  setIsButtonDisabled
}: RegisterAccountFormFieldsProps) {
  const { register } = useForm<RegisterAccountInput>()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  return (
    <div>
      <p className="mb-[30px] text-xl font-medium">Create Your Account</p>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-[6px]">
          <IDLabel />
          <InputForm placeholder="User ID" name="username" type="text" />
        </div>
        <div className="flex flex-col gap-[6px]">
          <PasswordLabel />
          <div className="relative">
            <Input
              placeholder="Password"
              type={isPasswordVisible ? 'text' : 'password'}
              {...register('password')}
            />
            <VisibleButton
              isVisible={isPasswordVisible}
              setIsVisible={setIsPasswordVisible}
            />
          </div>
          <div className="relative">
            <Input
              placeholder="Re-enter Password"
              type={isPasswordVisible ? 'text' : 'password'}
              {...register('passwordConfirm')}
            />
            <VisibleButton
              isVisible={isPasswordVisible}
              setIsVisible={setIsPasswordVisible}
            />
          </div>
        </div>
      </div>
    </div>
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

export function SignUpRegisterMajor() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  return (
    <RegisterAccountForm>
      <RegisterAccountFormFields setIsButtonDisabled={setIsButtonDisabled} />
      <Button
        type="submit"
        className="w-full px-[22px] py-[9px] text-base font-medium"
        disabled={isButtonDisabled}
      >
        Next
      </Button>
    </RegisterAccountForm>
  )
}
