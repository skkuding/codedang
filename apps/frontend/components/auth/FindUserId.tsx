import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn, fetcher, isHttpError, safeFetcher } from '@/libs/utils'
import useAuthModalStore from '@/stores/authModal'
import useRecoverAccountModalStore from '@/stores/recoverAccountModal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface FindUserIdInput {
  email: string
}
const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' })
})

export default function FindUserId() {
  const [userId, setUserId] = useState<string>('')
  const [emailError, setEmailError] = useState<string>('')
  const [wrongEmail, setWrongEmail] = useState<string>('')
  const [sentEmail, setSentEmail] = useState<boolean>(false)
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
    formState: { errors }
  } = useForm<FindUserIdInput>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FindUserIdInput) => {
    const { email } = data
    try {
      const data: { username: string } = await fetcher
        .get('user/email', {
          searchParams: { email }
        })
        .json()
      if (data.username) {
        setUserId(data.username)
        setEmailError('')
      } else {
        setEmailError('No account confirmed with this email')
        setWrongEmail(email)
      }
    } catch {
      setEmailError('No account confirmed with this email')
      setWrongEmail(email)
    }
  }

  const resetPassword = async () => {
    const { email } = getValues()
    setFormData({
      email,
      verificationCode: '',
      headers: {
        'email-auth': ''
      }
    })
    await trigger('email')

    if (errors.email || sentEmail) {
      return
    }

    try {
      await safeFetcher.post('email-auth/send-email/password-reset', {
        json: { email }
      })
      setSentEmail(true)
      setEmailError('')
      nextModal()
    } catch (error) {
      if (isHttpError(error) && error.response.status === 401) {
        setEmailError('Email authentication pin is sent to your email address')
      } else {
        setEmailError('Something went wrong!')
      }
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
            disabled={Boolean(userId)}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email?.message}</p>
          )}
          {emailError && getValues('email') === wrongEmail && (
            <p className="text-xs text-red-500">{emailError}</p>
          )}
          {userId && (
            <p className="mt-4 text-center text-sm text-gray-700">
              Your user ID is{' '}
              <span className="text-primary font-bold">{userId}</span>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {userId ? (
            <Button
              onClick={() => showSignIn()}
              type="button"
              className="font-semibold"
            >
              Log in
            </Button>
          ) : (
            <Button type="submit" className="font-semibold">
              Find Your User ID
            </Button>
          )}
          <Button
            type="button"
            onClick={resetPassword}
            className={cn(
              'border bg-white font-semibold',
              userId
                ? 'border-primary text-primary hover:bg-blue-100'
                : 'border-gray-300 text-gray-300'
            )}
            disabled={!userId}
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
