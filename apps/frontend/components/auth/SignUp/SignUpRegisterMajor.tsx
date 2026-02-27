'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { Button } from '@/components/shadcn/button'
import { colleges } from '@/libs/constants'
import { safeFetcher } from '@/libs/utils'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'
import { MajorLabel } from '../AuthLabel'

interface RegisterMajorInput {
  affiliation: string
  major: string
}

const schema = v.object({
  affiliation: v.pipe(v.string(), v.minLength(1, 'Affiliation is required')),
  major: v.pipe(v.string(), v.minLength(1, 'Major is required'))
})

function RegisterMajorForm({ children }: { children: ReactNode }) {
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const methods = useForm<RegisterMajorInput>({
    resolver: valibotResolver(schema),
    mode: 'onChange', // 실시간 validation 추가
    defaultValues: {
      affiliation: '',
      major: ''
    }
  })

  const onSubmit = async (data: RegisterMajorInput) => {
    const updatedFormData = {
      ...formData,
      ...data
    }

    setFormData(updatedFormData)

    try {
      await safeFetcher.post('user/sign-up', {
        headers: {
          ...updatedFormData.headers
        },
        json: {
          username: updatedFormData.username,
          password: updatedFormData.password,
          email: updatedFormData.email,
          realName: updatedFormData.realName,
          studentId: updatedFormData.studentId,
          affiliation: updatedFormData.affiliation,
          major: updatedFormData.major
        }
      })
      nextModal()
    } catch {
      toast.error('Failed to register. Please try again.')
    }
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
  const { watch, setValue } = useFormContext<RegisterMajorInput>()
  const watchAffiliation = watch('affiliation')
  const watchMajor = watch('major')

  useEffect(() => {
    const hasValues = watchAffiliation && watchMajor
    setIsButtonDisabled(!hasValues)
  }, [watchAffiliation, watchMajor, setIsButtonDisabled])

  return (
    <div>
      <p className="text-title2_m_20">Tell Us About Yourself</p>
      <p className="text-color-neutral-70 text-body4_r_14 mb-[30px]">
        Make sure to fill out the whole form
      </p>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-[6px]">
          <MajorLabel />
          <OptionSelect
            options={colleges.map((college) => college.name)}
            value={watchAffiliation}
            onChange={(value) => {
              setValue('affiliation', value, { shouldValidate: true })
              setValue('major', '', { shouldValidate: true })
            }}
            className="text-body3_r_16 truncate"
            placeholder="Affiliation"
          />
          <OptionSelect
            options={colleges
              .filter((college) => college.name === watchAffiliation)
              .flatMap((college) => college.majors)}
            value={watchMajor}
            onChange={(value) => {
              setValue('major', value, { shouldValidate: true })
            }}
            className="text-body3_r_16 truncate"
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
        className="text-body1_m_16 w-full px-[22px] py-[9px]"
        disabled={isButtonDisabled}
      >
        Register
      </Button>
    </RegisterMajorForm>
  )
}
