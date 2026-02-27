'use client'

import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import * as v from 'valibot'
import { RealNameLabel, StudentIDLabel } from '../AuthLabel'

interface RegisterInfoInput {
  realName: string
  studentId: string
}

const schema = (t: (key: string) => string) =>
  v.object({
    realName: v.pipe(v.string(), v.minLength(1, 'Name is required')),
    studentId: v.pipe(
      v.string(),
      v.length(10, t('student_id_must_be_10_characters_long'))
    )
  })

function RegisterInfoForm({ children }: { children: ReactNode }) {
  const { t } = useTranslate()
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const methods = useForm<RegisterInfoInput>({
    mode: 'onChange',
    resolver: valibotResolver(schema(t)),
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
  const {
    register,
    formState: { isValid }
  } = useFormContext<RegisterInfoInput>()

  const { t } = useTranslate()

  useEffect(() => {
    setIsButtonDisabled(!isValid)
  }, [isValid])

  return (
    <div>
      <p className="text-xl font-medium">{t('tell_us_about_yourself')}</p>
      <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
        {t('fill_out_the_whole_form')}
      </p>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-[6px]">
          <RealNameLabel />
          <Input
            placeholder={t('name_placeholder')}
            type="text"
            {...register('realName')}
          />
        </div>
        <div className="flex flex-col gap-[6px]">
          <StudentIDLabel />
          <Input
            placeholder={t('student_id_placeholder')}
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
  const { t } = useTranslate()

  return (
    <RegisterInfoForm>
      <RegisterInfoFormFields setIsButtonDisabled={setIsButtonDisabled} />
      <Button
        type="submit"
        className="w-full px-[22px] py-[9px] text-base font-medium"
        disabled={isButtonDisabled}
      >
        {t('next_button')}
      </Button>
    </RegisterInfoForm>
  )
}
