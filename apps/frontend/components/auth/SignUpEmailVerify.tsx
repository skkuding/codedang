import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { baseUrl } from '@/lib/constants'
import { cn } from '@/lib/utils'
import useSignUpModalStore from '@/stores/signUpModal'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface EmailVerifyInput {
  email: string
  verificationCode: string
}

const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  verificationCode: z
    .string()
    .min(6, { message: 'Code must be 6 characters long' })
    .max(6, { message: 'Code must be 6 characters long' })
})

const timeLimit = 300

export default function SignUpEmailVerify() {
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
    formState: { errors }
  } = useForm<EmailVerifyInput>({
    resolver: zodResolver(schema)
  })
  const [sentEmail, setSentEmail] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string>('')
  const [emailContent, setEmailContent] = useState<string>('')
  const [codeError, setCodeError] = useState<string>('')
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [emailAuthToken, setEmailAuthToken] = useState<string>('')
  const [sendButtonDisabled, setSendButtonDisabled] = useState<boolean>(false)

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
    setEmailContent(email)
    setEmailError('')
    await trigger('email')
    if (!errors.email) {
      await fetch(baseUrl + '/email-auth/send-email/register-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
        .then((res) => {
          if (res.status === 409) {
            setEmailError('You have already signed up')
            setSendButtonDisabled(false)
          } else if (res.status === 201) {
            setSentEmail(true)
            setEmailError('')
            setSendButtonDisabled(false)
          }
        })
        .catch(() => {
          setEmailError('Something went wrong!')
        })
    }
  }
  const verifyCode = async () => {
    const { verificationCode } = getValues()
    await trigger('verificationCode')
    if (!errors.verificationCode) {
      try {
        const response = await fetch(baseUrl + '/email-auth/verify-pin', {
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
      className="flex w-full flex-col gap-2"
    >
      <p className="mb-4 text-left font-mono text-xl font-bold text-blue-500">
        Sign up
      </p>
      {!sentEmail && (
        <div>
          <Input
            id="email"
            type="email"
            className={cn(
              'focus-visible:ring-primary w-full focus-visible:ring-1',
              (emailError || errors.email) && 'ring-1 ring-red-500'
            )}
            placeholder="example@g.skku.edu"
            {...register('email')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !sendButtonDisabled) {
                e.preventDefault()
                setSendButtonDisabled(true)
                sendEmail()
              }
            }}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email?.message}</p>
          )}
          {emailError && (
            <p className="mt-1 text-xs text-red-500">{emailError}</p>
          )}
        </div>
      )}
      {sentEmail && (
        <div>
          <div className="flex justify-between">
            <div className="text-sm text-black">{emailContent}</div>
            {sentEmail && !expired && (
              <p className="text-red-500">{formatTimer()}</p>
            )}
          </div>
          <Input
            type="number"
            className={cn(
              'mt-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
              'focus-visible:ring-primary w-full focus-visible:ring-1',
              (errors.verificationCode || expired || codeError) &&
                'ring-1 ring-red-500 focus-visible:ring-red-500'
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
              <p className="text-primary mt-1 text-xs">
                We&apos;ve sent an email
              </p>
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
        </div>
      )}

      {!sentEmail ? (
        <Button
          type="button"
          className="mt-4 w-full font-semibold"
          disabled={sendButtonDisabled}
          onClick={() => {
            setSendButtonDisabled(true)
            sendEmail()
          }}
        >
          Send Email
        </Button>
      ) : !expired ? (
        <Button
          type="submit"
          className={cn(
            'mt-2 w-full font-semibold',
            (!emailVerified || !!errors.verificationCode) && 'bg-gray-400'
          )}
          disabled={!emailVerified || !!errors.verificationCode}
        >
          Next
        </Button>
      ) : (
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
      )}
    </form>
  )
}
