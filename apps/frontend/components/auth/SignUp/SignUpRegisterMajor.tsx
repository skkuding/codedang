'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { Button } from '@/components/shadcn/button'
import { colleges } from '@/libs/constants'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import * as v from 'valibot'
import { MajorLabel } from '../AuthLabel'

interface RegisterMajorInput {
  affiliation: string
  major: string
}

const schema = v.object({})

function RegisterMajorForm({ children }: { children: ReactNode }) {
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const methods = useForm<RegisterMajorInput>({
    resolver: valibotResolver(schema),
    defaultValues: {
      affiliation: '',
      major: ''
    }
  })

  const onSubmit = (data: RegisterMajorInput) => {
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

interface RegisterMajorFormFieldsProps {
  setIsButtonDisabled: (isDisabled: boolean) => void
}

function RegisterMajorFormFields({
  setIsButtonDisabled
}: RegisterMajorFormFieldsProps) {
  const { register, watch, setValue } = useFormContext<RegisterMajorInput>()
  const watchAffiliation = watch('affiliation')
  const watchMajor = watch('major')

  useEffect(() => {
    const hasValues = watchAffiliation && watchMajor
    setIsButtonDisabled(!hasValues)
  }, [watchAffiliation, watchMajor])
  return (
    <div>
      <p className="text-xl font-medium">Tell us About You</p>
      <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
        Make sure to fill out the whole form
      </p>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-[6px]">
          <MajorLabel />
          <OptionSelect
            options={colleges.map((college) => college.name)}
            value={watchAffiliation}
            onChange={(value) => {
              setValue('affiliation', value)
            }}
            className="truncate text-base font-normal"
            placeholder="Affiliation"
          />
          <OptionSelect
            options={colleges
              .filter((college) => college.name === watchAffiliation)
              .flatMap((college) => college.majors)}
            value={watchMajor}
            onChange={(value) => {
              setValue('major', value)
            }}
            className="truncate text-base font-normal"
            placeholder="First Major"
          />
        </div>
      </div>
    </div>
  )
}

export function SignUpRegisterMajor() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  return (
    <RegisterMajorForm>
      <RegisterMajorFormFields setIsButtonDisabled={setIsButtonDisabled} />
      <Button
        type="submit"
        className="w-full px-[22px] py-[9px] text-base font-medium"
        disabled={isButtonDisabled}
      >
        Register
      </Button>
    </RegisterMajorForm>
  )
}
