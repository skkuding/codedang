'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { Button } from '@/components/shadcn/button'
import { colleges } from '@/libs/constants'
import { safeFetcher } from '@/libs/utils'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'
import { MajorLabel } from '../AuthLabel'

interface RegisterMajorInput {
  affiliation: string
  major: string
}

const schema = (t: (key: string) => string) =>
  v.object({
    affiliation: v.pipe(
      v.string(),
      v.minLength(1, t('affiliation_is_required'))
    ),
    major: v.pipe(v.string(), v.minLength(1, t('major_is_required')))
  })

function RegisterMajorForm({ children }: { children: ReactNode }) {
  const { t } = useTranslate()
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const methods = useForm<RegisterMajorInput>({
    resolver: valibotResolver(schema(t)),
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
      toast.error(t('failed_to_register_please_try_again'))
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

  const { t } = useTranslate()

  useEffect(() => {
    const hasValues = watchAffiliation && watchMajor
    setIsButtonDisabled(!hasValues)
  }, [watchAffiliation, watchMajor, setIsButtonDisabled])

  return (
    <div>
      <p className="text-xl font-medium">{t('tell_us_about_yourself')}</p>
      <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
        {t('fill_out_the_whole_form')}
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
            className="truncate text-base font-normal"
            placeholder={t('affiliation_placeholder')}
          />
          <OptionSelect
            options={colleges
              .filter((college) => college.name === watchAffiliation)
              .flatMap((college) => college.majors)}
            value={watchMajor}
            onChange={(value) => {
              setValue('major', value, { shouldValidate: true })
            }}
            className="truncate text-base font-normal"
            placeholder={t('first_major_placeholder')}
          />
        </div>
      </div>
    </div>
  )
}

export function SignUpRegisterMajor() {
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)

  const { t } = useTranslate()

  return (
    <RegisterMajorForm>
      <RegisterMajorFormFields setIsButtonDisabled={setIsButtonDisabled} />
      <Button
        type="submit"
        className="w-full px-[22px] py-[9px] text-base font-medium"
        disabled={isButtonDisabled}
      >
        {t('register_button')}
      </Button>
    </RegisterMajorForm>
  )
}
