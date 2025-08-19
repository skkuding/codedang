import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn, isHttpError, safeFetcher } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

interface SendEmailInput {
  email: string
}

const schema = v.object({
  email: v.pipe(v.string())
})

const DOMAIN_OPTIONS = ['@skku.edu', '@g.skku.edu', '@naver.com']

export function SignUpSendEmail() {
  const { nextModal, setFormData } = useSignUpModalStore((state) => state)
  const {
    handleSubmit,
    register,
    getValues,
    trigger,
    clearErrors,
    formState: { errors }
  } = useForm<SendEmailInput>({
    resolver: valibotResolver(schema)
  })
  const [emailError, setEmailError] = useState<string>('')
  const [sendButtonDisabled, setSendButtonDisabled] = useState<boolean>(false)
  const [domain, setDomain] = useState<string>(DOMAIN_OPTIONS[0])
  const { showSignIn } = useAuthModalStore((state) => state)

  const onSubmit = (data: SendEmailInput) => {
    setFormData({
      ...data,
      verificationCode: '',
      headers: {
        'email-auth': ''
      }
    })
    nextModal()
  }

  const sendEmail = async () => {
    const { email } = getValues()
    const fullEmail = `${email}${domain}`

    setEmailError('')
    await trigger('email')

    if (errors.email) {
      setSendButtonDisabled(false)
      return
    }

    try {
      await safeFetcher.post('email-auth/send-email/register-new', {
        json: { email: fullEmail }
      })
      setEmailError('')
    } catch (error) {
      if (isHttpError(error) && error.response.status === 409) {
        setEmailError('You have already signed up')
      } else {
        setEmailError('Something went wrong!')
      }
    } finally {
      setSendButtonDisabled(false)
    }
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
              (emailError || errors.email) &&
                'border-red-500 focus-visible:border-red-500'
            )}
            placeholder="Enter the e-mail"
            {...register('email')}
            onFocus={() => clearErrors('email')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !sendButtonDisabled) {
                e.preventDefault()
                setSendButtonDisabled(true)
                sendEmail()
              }
            }}
          />
          <OptionSelect
            options={DOMAIN_OPTIONS}
            value={domain}
            onChange={setDomain}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email?.message}</p>
        )}
        {emailError && (
          <p className="mt-1 text-xs text-red-500">{emailError}</p>
        )}
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
          type="button"
          className="w-full px-[22px] py-[9px] text-base font-medium"
          disabled={sendButtonDisabled}
          onClick={() => {
            setSendButtonDisabled(true)
            sendEmail()
          }}
        >
          Send the Email
        </Button>
      </div>
    </form>
  )
}
