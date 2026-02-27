import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { ALLOWED_DOMAINS } from '@/libs/constants'
import { cn, isHttpError } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { useForm } from 'react-hook-form'
import { AuthMessage } from '../AuthMessage'
import { SignUpApi } from './api'

interface SendEmailInput {
  emailId: string
  emailDomain: string
}

export function SignUpSendEmail() {
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
          message: 'You have already signed up'
        })
      } else {
        setError('emailId', {
          message: 'Something went wrong!'
        })
      }
    }
  }

  function renderFormHeader() {
    return (
      <>
        <p className="text-title2_m_20">Join us to grow!</p>
        <p className="text-color-neutral-70 text-body4_r_14 mb-[30px]">
          You can only use{' '}
          <span className="text-primary">{ALLOWED_DOMAINS[0]}</span> emails
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
            placeholder="Enter the e-mail"
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
            className="text-body3_r_16"
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
          <span className="text-body4_r_14">Already have account?</span>
          <Button
            onClick={showSignIn}
            variant="link"
            className="text-body4_r_14 underline"
          >
            Log in
          </Button>
        </div>
        <Button
          type="submit"
          className="text-body1_m_16 w-full px-[22px] py-[9px]"
          disabled={isSendButtonDisabled}
        >
          Send the Email
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
