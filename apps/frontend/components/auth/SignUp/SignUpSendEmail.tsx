import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn, isHttpError, safeFetcher } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

const DOMAIN_OPTIONS = [
  '@skku.edu',
  '@g.skku.edu',
  '@naver.com',
  '@example.com'
]
interface SendEmailInput {
  email: string
}

export function SignUpSendEmail() {
  const { nextModal, setFormData } = useSignUpModalStore((state) => state)

  const { handleSubmit, register, getValues, clearErrors, watch } =
    useForm<SendEmailInput>()

  const [emailError, setEmailError] = useState<string>('')
  const [domain, setDomain] = useState<string>(DOMAIN_OPTIONS[0])
  const { showSignIn } = useAuthModalStore((state) => state)

  const emailValue = watch('email', '')
  const isButtonDisabled = emailValue.trim().length === 0

  const onSubmit = async (data: SendEmailInput) => {
    try {
      await sendEmail()
      setFormData({
        ...data,
        verificationCode: '',
        headers: {
          'email-auth': ''
        }
      })
      nextModal()
    } catch (error) {
      if (isHttpError(error) && error.response.status === 409) {
        setEmailError('You have already signed up')
      } else {
        setEmailError('Something went wrong!')
      }
    }
  }

  const sendEmail = async () => {
    const { email } = getValues()
    const fullEmail = `${email}${domain}`

    await safeFetcher.post('email-auth/send-email/register-new', {
      json: { email: fullEmail }
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full flex-col justify-between"
    >
      <div>
        <p className="text-xl font-medium">Join us to grow! 🌱</p>
        <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
          You can only use <span className="text-primary">@skku.edu</span>{' '}
          emails
        </p>
        <div className="flex gap-1">
          <Input
            id="email"
            type="text"
            className={cn(
              'focus-visible:border-primary rounded-full placeholder:text-gray-400 focus-visible:ring-0',
              emailError && 'border-red-500 focus-visible:border-red-500'
            )}
            placeholder="Enter the e-mail"
            {...register('email')}
            onFocus={() => clearErrors('email')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit(onSubmit)()
              }
            }}
          />
          <OptionSelect
            options={DOMAIN_OPTIONS}
            value={domain}
            onChange={setDomain}
          />
        </div>
        {emailError && <p className="text-error mt-1 text-xs">{emailError}</p>}
      </div>
      <div className="flex flex-col gap-[12.5px]">
        <div className="text-color-neutral-50 flex items-center justify-center">
          <span className="text-sm font-normal">Already have account?</span>
          <Button
            onClick={showSignIn}
            variant="link"
            className="text-sm font-normal underline"
          >
            Log In
          </Button>
        </div>
        <Button
          type="submit"
          className="w-full px-[22px] py-[9px] text-base font-medium"
          disabled={isButtonDisabled}
        >
          Send the Email
        </Button>
      </div>
    </form>
  )
}
