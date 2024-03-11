import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { baseUrl } from '@/lib/constants'
import { cn } from '@/lib/utils'
import useSignUpModalStore from '@/stores/signUpModal'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useInterval } from 'react-use'
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

  useInterval(
    () => {
      if (timer > 0) {
        setTimer((prevTimer) => prevTimer - 1)
      }
    },
    sentEmail ? 1000 : null
  )

  useEffect(() => {
    if (timer === 0) {
      setExpired(true)
    }
  }, [timer])

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
    await trigger('email')
    if (!errors.email && !sentEmail) {
      await fetch(baseUrl + '/email-auth/send-email/register-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
        .then((res) => {
          if (res.status === 409) {
            setEmailError('You have already signed up!')
          } else if (res.status === 201) {
            setSentEmail(true)
            setEmailError('')
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
          setCodeError('Verification code is not valid!')
        }
      } catch {
        setCodeError('Email verification failed!')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1">
      {sentEmail && !expired && (
        <p className="absolute right-10 top-10 text-red-500">{formatTimer()}</p>
      )}
      <p className="mb-4 text-left text-xl font-bold text-blue-500">Sign Up</p>
      {!sentEmail && (
        <Input
          id="email"
          type="email"
          className="w-64"
          placeholder="Email Address"
          {...register('email')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              sendEmail()
            }
          }}
        />
      )}
      {errors.email && (
        <p className="text-xs text-red-500">{errors.email?.message}</p>
      )}
      <p className="text-xs text-red-500">{emailError}</p>
      {sentEmail && (
        <>
          <div className="text-sm font-semibold text-gray-500">
            {emailContent}
          </div>
          <Input
            type="number"
            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="Verification Code"
            {...register('verificationCode', {
              onChange: () => verifyCode()
            })}
          />
        </>
      )}
      <p className="text-xs text-red-500">
        {errors.verificationCode ? errors.verificationCode?.message : codeError}
      </p>
      {sentEmail &&
        !expired &&
        !errors.verificationCode &&
        codeError === '' &&
        !emailVerified && (
          <p className="text-xs text-blue-500">We&apos;ve sent an email!</p>
        )}
      {expired && (
        <p className="text-xs text-red-500">
          Verification code expired
          <br />
          Please resend an email and try again
        </p>
      )}
      {!sentEmail ? (
        <Button
          type="button"
          className="mb-8 mt-2 w-64"
          onClick={() => sendEmail()}
        >
          Send Email
        </Button>
      ) : !expired ? (
        <Button
          type="submit"
          className={cn('mb-8 mt-2 w-64', !emailVerified && 'bg-gray-400')}
          disabled={!emailVerified}
        >
          Next
        </Button>
      ) : (
        <Button
          type="submit"
          className="mb-8 mt-2 w-64"
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
