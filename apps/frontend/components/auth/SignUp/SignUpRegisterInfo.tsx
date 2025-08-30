'use client'

import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import * as v from 'valibot'
import { RealNameLabel, StudentIDLabel } from '../AuthLabel'

interface RegisterInfoInput {
  realName: string
  studentId: string
}

const schema = v.object({
  realName: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  studentId: v.pipe(v.string(), v.minLength(1, 'Student ID is required'))
})

function RegisterInfoForm({ children }: { children: ReactNode }) {
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const methods = useForm<RegisterInfoInput>({
    resolver: valibotResolver(schema),
    defaultValues: {
      realName: '',
      studentId: ''
    }
  })

  const onSubmit = (data: RegisterInfoInput) => {
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

interface RegisterInfoFormFieldsProps {
  setIsButtonDisabled: (isDisabled: boolean) => void
}

function RegisterInfoFormFields({
  setIsButtonDisabled
}: RegisterInfoFormFieldsProps) {
  const { register, watch } = useFormContext<RegisterInfoInput>()
  const watchRealName = watch('realName')
  const watchStudentId = watch('studentId')

  useEffect(() => {
    const hasValues =
      watchRealName &&
      watchRealName.trim().length > 0 &&
      watchStudentId &&
      watchStudentId.trim().length > 0
    setIsButtonDisabled(!hasValues)
  }, [watchRealName, watchStudentId, setIsButtonDisabled])
  return (
    <div>
      <p className="text-xl font-medium">Tell Us About Yourself</p>
      <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
        Make sure to fill out the whole form
      </p>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-[6px]">
          <RealNameLabel />
          <Input placeholder="Name" type="text" {...register('realName')} />
        </div>
        <div className="flex flex-col gap-[6px]">
          <StudentIDLabel />
          <Input
            placeholder="Student ID"
            type="number"
            {...register('studentId')}
          />
        </div>
      </div>
    </div>
  )
}

export function SignUpRegisterInfo() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  return (
    <RegisterInfoForm>
      <RegisterInfoFormFields setIsButtonDisabled={setIsButtonDisabled} />
      <Button
        type="submit"
        className="w-full px-[22px] py-[9px] text-base font-medium"
        disabled={isButtonDisabled}
      >
        Next
      </Button>
    </RegisterInfoForm>
  )
}
