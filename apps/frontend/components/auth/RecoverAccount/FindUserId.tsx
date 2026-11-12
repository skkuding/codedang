import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn, fetcher, isHttpError, safeFetcher } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { useRecoverAccountModalStore } from '@/stores/recoverAccountModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

interface FindUserIdInput {
  email: string
}
const schema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email address'))
})

export function FindUserId() {
  const [emailError, setEmailError] = useState<string>('')
  const [wrongEmail, setWrongEmail] = useState<string>('')
  const [idSent, setIdSent] = useState<boolean>(false)
  const [sentEmail, setSentEmail] = useState<boolean>(false)
  const [resetPending, setResetPending] = useState(false)
  const resetInFlight = useRef(false)
  const [inputFocused, setInputFocused] = useState<boolean>(false)
  const { nextModal, setFormData } = useRecoverAccountModalStore(
    (state) => state
  )
  const { showSignIn, showSignUp } = useAuthModalStore((state) => state)

  const {
    handleSubmit,
    register,
    trigger,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<FindUserIdInput>({
    resolver: valibotResolver(schema)
  })

  const onSubmit = async (data: FindUserIdInput) => {
    const { email } = data
    try {
      await fetcher
        .get('user/email', {
          searchParams: { email }
        })
        .json()
      setEmailError('')
      setIdSent(true)
    } catch {
      setEmailError('Request failed. Please try again.')
      setWrongEmail(email)
    }
  }

  const resetPassword = async () => {
    if (resetInFlight.current || sentEmail) {
      return
    }
    resetInFlight.current = true
    setResetPending(true)
    let email = ''

    try {
      const isValid = await trigger('email')

      if (!isValid) {
        return
      }

      email = getValues('email')
      setFormData({
        email,
        verificationCode: '',
        headers: {
          'email-auth': ''
        }
      })

      await safeFetcher.post('email-auth/send-email/password-reset', {
        json: { email }
      })
      setSentEmail(true)
      setEmailError('')
      nextModal()
    } catch (error) {
      setWrongEmail(email)
      if (isHttpError(error) && error.response.status === 401) {
        setEmailError('Email authentication pin is sent to your email address')
      } else if (isHttpError(error) && error.response.status === 429) {
        setEmailError(
          `Too many requests. Please try again later.\n(Once per 60 seconds / 5 per hour / 10 per day)`
        )
      } else {
        setEmailError('Something went wrong!')
      }
    } finally {
      resetInFlight.current = false
      setResetPending(false)
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-6 px-2"
      >
        <div className="flex flex-col gap-1">
          <p className="text-primary mb-4 text-left font-mono text-xl font-bold">
            Find User ID
          </p>
          <Input
            id="email"
            type="email"
            className={cn(
              inputFocused && 'ring-1 focus-visible:ring-1 disabled:ring-0',
              errors.email || (emailError && getValues('email') === wrongEmail)
                ? 'ring-red-500 focus-visible:ring-red-500'
                : 'focus-visible:ring-primary'
            )}
            placeholder="Email Address"
            {...register('email', {
              onChange: () => trigger('email')
            })}
            onFocus={() => setInputFocused(true)}
            onBlur={() => trigger('email')}
            disabled={idSent}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email?.message}</p>
          )}
          {emailError && getValues('email') === wrongEmail && (
            <p className="whitespace-pre-line text-xs text-red-500">
              {emailError}
            </p>
          )}
          {idSent && (
            <p className="mt-4 text-center text-sm text-gray-700">
              Your user ID is{' '}
              <span className="text-primary font-bold">
                sent to your email if registered
              </span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {idSent ? (
            <Button
              onClick={() => showSignIn()}
              type="button"
              className="font-semibold"
            >
              Log in
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="font-semibold"
            >
              Find Your User ID
            </Button>
          )}
          <Button
            type="button"
            onClick={resetPassword}
            disabled={resetPending || sentEmail}
            className={cn(
              'border-primary text-primary border bg-white font-semibold hover:bg-blue-100'
            )}
          >
            Reset Password
          </Button>
        </div>
      </form>
      <div className="absolute bottom-6 flex items-center justify-center">
        <Button
          onClick={() => showSignUp()}
          variant={'link'}
          className="h-5 w-fit p-0 py-2 text-xs text-gray-500"
        >
          Sign up now
        </Button>
      </div>
    </>
  )
}
