import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { ALLOWED_DOMAINS } from '@/libs/constants'
import { cn, isHttpError } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { useTranslate } from '@tolgee/react'
import { useForm } from 'react-hook-form'
import { AuthMessage } from '../AuthMessage'
import { SignUpApi } from './api'

interface SendEmailInput {
  emailId: string
  emailDomain: string
}

export function SignUpSendEmail() {
  const { t } = useTranslate()

  const { formData, nextModal, setFormData } = useSignUpModalStore(
    (state) => state
  )
  const { showSignIn } = useAuthModalStore((state) => state)
  const {
    handleSubmit,
    register,
    clearErrors,
    watch,
    setValue,
    setError,
    formState: { errors }
  } = useForm<SendEmailInput>({
    defaultValues: { emailDomain: ALLOWED_DOMAINS[0] }
  })
  const watchEmailId = watch('emailId', '')
  const watchEmailDomain = watch('emailDomain')
  const isSendButtonDisabled = watchEmailId.trim().length === 0

  const onSubmit = async (data: SendEmailInput) => {
    const email = `${data.emailId}@${data.emailDomain}`
    try {
      await SignUpApi.sendEmail(email)
      setFormData({
        ...formData,
        email
      })
      nextModal()
    } catch (error) {
      if (isHttpError(error) && error.response.status === 409) {
        setError('emailId', {
          message: t('already_signed_up')
        })
      } else {
        setError('emailId', {
          message: t('error_something_went_wrong')
        })
      }
    }
  }

  function renderFormHeader() {
    return (
      <>
        <p className="text-xl font-medium">{t('join_us_to_grow')}</p>
        <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
          {t('you_can_only_use_email_domains_1')}{' '}
          <span className="text-primary">{ALLOWED_DOMAINS[0]}</span>{' '}
          {t('you_can_only_use_email_domains_2')}
        </p>
      </>
    )
  }

  function renderFormBody() {
    return (
      <>
        <div className="flex gap-1">
          <Input
            id="emailId"
            type="text"
            className={cn(
              errors.emailId && 'border-red-500 focus-visible:border-red-500'
            )}
            placeholder={t('enter_the_email')}
            {...register('emailId')}
            onFocus={() => clearErrors('emailId')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit(onSubmit)()
              }
            }}
          />
          <OptionSelect
            options={ALLOWED_DOMAINS}
            value={watchEmailDomain}
            onChange={(value) => {
              setValue('emailDomain', value)
            }}
            prefix="@"
            className="text-base font-normal"
          />
        </div>
        {errors.emailId && (
          <AuthMessage type={'error'} message={errors.emailId.message ?? ''} />
        )}
      </>
    )
  }

  function renderFormFooter() {
    return (
      <div className="flex flex-col gap-[12.5px]">
        <div className="text-color-neutral-50 flex items-center justify-center">
          <span className="text-sm font-normal">
            {t('already_have_account')}
          </span>
          <Button
            onClick={showSignIn}
            variant="link"
            className="text-sm font-normal underline"
          >
            {t('log_in_button')}
          </Button>
        </div>
        <Button
          type="submit"
          className="w-full px-[22px] py-[9px] text-base font-medium"
          disabled={isSendButtonDisabled}
        >
          {t('send_the_email_button')}
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full flex-col justify-between"
    >
      <div>
        {renderFormHeader()}
        {renderFormBody()}
      </div>
      {renderFormFooter()}
    </form>
  )
}
