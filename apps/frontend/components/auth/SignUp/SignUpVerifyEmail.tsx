import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { baseUrl } from '@/libs/constants'
import { cn, isHttpError, safeFetcher } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'

interface EmailVerifyInput {
  email: string
  verificationCode: string
}

const schema = v.object({
  email: v.pipe(
    v.string(),
    v.transform((value) => `${value}@skku.edu`), // Transform for validation only
    v.email('Invalid email format')
  ),
  verificationCode: v.pipe(
    v.string(),
    v.length(6, 'Code must be 6 characters long')
  )
})

const timeLimit = 300
const DOMAIN_OPTIONS = ['@skku.edu', '@g.skku.edu', '@naver.com']

export function SignUpVerifyEmail() {
  const [timer, setTimer] = useState(timeLimit)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousTimeRef = useRef(Date.now())
  const [expired, setExpired] = useState(false)
  const { nextModal, setFormData } = useSignUpModalStore((state) => state)
  const {
    handleSubmit,
    register,
    getValues,
    trigger,
    clearErrors,
    formState: { errors }
  } = useForm<EmailVerifyInput>({
    resolver: valibotResolver(schema)
  })
  const [sentEmail, setSentEmail] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string>('')
  const [emailContent, setEmailContent] = useState<string>('')
  const [codeError, setCodeError] = useState<string>('')
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [emailAuthToken, setEmailAuthToken] = useState<string>('')
  const [sendButtonDisabled, setSendButtonDisabled] = useState<boolean>(false)
  const [domain, setDomain] = useState<string>(DOMAIN_OPTIONS[0])
  const { showSignIn } = useAuthModalStore((state) => state)
  useEffect(() => {
    if (sentEmail && !expired) {
      previousTimeRef.current = Date.now()
      intervalRef.current = setInterval(() => {
        const currentTime = Date.now()
        const elapsedTime = (currentTime - previousTimeRef.current) / 1000
        previousTimeRef.current = currentTime

        setTimer((prevTimer) => {
          const updatedTimer = Math.max(prevTimer - Math.round(elapsedTime), 0)
          if (updatedTimer === 0) {
            setExpired(true)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
            }
          }
          return updatedTimer
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [sentEmail, expired])

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const onSubmit = (data: EmailVerifyInput) => {
    setFormData({
      ...data,
      headers: {
        'email-auth': emailAuthToken
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

  const verifyCode = async () => {
    const { verificationCode } = getValues()
    await trigger('verificationCode')
    if (!errors.verificationCode) {
      try {
        const response = await fetch(`${baseUrl}/email-auth/verify-pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            pin: verificationCode,
            email: emailContent
          })
        })
        if (response.status === 201) {
          setEmailVerified(true)
          setCodeError('')
          setEmailAuthToken(response.headers.get('email-auth') || '')
        } else {
          setCodeError('Verification code is not valid')
          setEmailVerified(false)
        }
      } catch {
        setEmailVerified(false)
        setCodeError('Email verification failed')
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-[50px] flex h-full flex-col justify-between"
    >
      <p className="text-left text-lg font-semibold text-black">
        We&apos;ve Sent an Email 📩
      </p>
      <p className="mb-5 text-left text-xs font-normal text-neutral-500">
        Please check an email on{' '}
        <span className="text-blue-500">
          <Link href="https://eportal.skku.edu/" target="_blank">
            eportal.skku.edu
          </Link>
        </span>
      </p>
      <div className="flex justify-between">
        <div className="text-sm text-black">{emailContent}</div>
        {sentEmail && !expired && (
          <p className="text-red-500">{formatTimer()}</p>
        )}
      </div>
      <Input
        type="number"
        className={cn(
          'hide-spin-button mt-2',
          'focus-visible:border-primary w-full rounded-full focus-visible:ring-0',
          (errors.verificationCode || expired || codeError) &&
            'border-red-500 focus-visible:border-red-500'
        )}
        placeholder="Verification Code"
        {...register('verificationCode', {
          onChange: () => verifyCode()
        })}
      />
      {sentEmail &&
        !expired &&
        !errors.verificationCode &&
        !codeError &&
        !emailVerified && (
          <p className="text-primary mt-1 text-xs">We&apos;ve sent an email</p>
        )}
      {expired && (
        <p className="mt-1 text-xs text-red-500">
          Verification code expired
          <br />
          Please resend an email and try again
        </p>
      )}
      {!expired && (
        <p className="mt-1 text-xs text-red-500">
          {errors.verificationCode
            ? errors.verificationCode?.message
            : codeError}
        </p>
      )}

      <div className="text-color-neutral-50 flex flex-col gap-[12.5px] text-sm font-normal">
        <div className="flex items-center justify-center">
          <span>Already have account?</span>
          <Button
            onClick={() => showSignIn()}
            variant={'link'}
            className="text-sm font-normal underline"
          >
            Log In
          </Button>
        </div>
        {(() => {
          if (!expired) {
            return (
              <Button
                type="submit"
                className={cn(
                  'w-full text-base font-medium',
                  (!emailVerified || Boolean(errors.verificationCode)) &&
                    'bg-gray-400'
                )}
                disabled={!emailVerified || Boolean(errors.verificationCode)}
              >
                Next
              </Button>
            )
          }

          return (
            <Button
              className="mt-2 w-full font-semibold"
              onClick={() => {
                setExpired(false)
                setTimer(timeLimit)
                sendEmail()
              }}
            >
              Resend Email
            </Button>
          )
        })()}
      </div>
    </form>
  )
}
