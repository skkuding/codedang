import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn, isHttpError } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { useForm } from 'react-hook-form'
import { AuthMessage } from '../AuthMessage'
import { SignUpApi } from './api'

const DOMAIN_OPTIONS = ['skku.edu']
interface SendEmailInput {
  emailId: string
  emailDomain: string
}

export function SignUpSendEmail() {
  const { nextModal, setFormData } = useSignUpModalStore((state) => state)
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
    defaultValues: { emailDomain: DOMAIN_OPTIONS[0] }
  })
  const watchEmailId = watch('emailId', '')
  const watchEmailDomain = watch('emailDomain')
  const isSendButtonDisabled = watchEmailId.trim().length === 0

  const onSubmit = async (data: SendEmailInput) => {
    const email = `${data.emailId}@${data.emailDomain}`
    try {
      await SignUpApi.sendEmail(email)
      setFormData({
        ...data,
        email,
        verificationCode: '',
        headers: {
          'email-auth': ''
        }
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
        <p className="text-xl font-medium">Join us to grow!</p>
        <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
          You can only use <span className="text-primary">@skku.edu</span>{' '}
          emails
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
            options={DOMAIN_OPTIONS}
            value={watchEmailDomain}
            onChange={(value) => {
              setValue('emailDomain', value)
            }}
            prefix="@"
            className="text-base font-normal"
          />
        </div>
        {errors.emailId && (
          <AuthMessage isError message={errors.emailId.message ?? ''} />
        )}
      </>
    )
  }

  function renderFormFooter() {
    return (
      <div className="flex flex-col gap-[12.5px]">
        <div className="text-color-neutral-50 flex items-center justify-center">
          <span className="text-sm font-normal">Already have account?</span>
          <Button
            onClick={showSignIn}
            variant="link"
            className="text-sm font-normal underline"
          >
            Log in
          </Button>
        </div>
        <Button
          type="submit"
          className="w-full px-[22px] py-[9px] text-base font-medium"
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
