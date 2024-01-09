import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { baseUrl } from '@/lib/vars'
import useSignUpModalStore from '@/stores/signUpModal'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
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

export default function SignUpEmailVerify() {
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
        body: JSON.stringify({
          email: email
        })
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
    <div className="mb-24 mt-24">
      <form onSubmit={handleSubmit(onSubmit)}>
        <p className="mb-5 mt-8 text-left text-xl font-bold text-blue-500">
          Sign Up
        </p>
        {!sentEmail && (
          <Input
            id="email"
            type="email"
            className="w-64"
            placeholder="Email Address"
            {...register('email')}
          />
        )}
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email?.message}</p>
        )}
        <p className="mt-1 text-xs text-red-500">{emailError}</p>
        {sentEmail && (
          <>
            <div className="mb-2 text-sm font-semibold text-gray-500">
              {emailContent}
            </div>
            <Input
              type="number"
              placeholder="Verification Code"
              {...register('verificationCode', {
                onChange: () => verifyCode()
              })}
            />
          </>
        )}
        {errors.verificationCode ? (
          <p className="mt-1 text-xs text-red-500">
            {errors.verificationCode?.message}
          </p>
        ) : (
          <p className="mt-1 text-xs text-red-500">{codeError}</p>
        )}
        {sentEmail &&
          !errors.verificationCode &&
          codeError === '' &&
          !emailVerified && (
            <p className="mt-1 text-xs text-blue-500">
              We&apos;ve sent an email!
            </p>
          )}

        {!sentEmail ? (
          <Button
            type="button"
            className="mt-3 w-64"
            onClick={() => sendEmail()}
          >
            Send Email
          </Button>
        ) : (
          <Button
            type="submit"
            className={`${
              emailVerified ? 'mt-3 w-64' : 'mt-3 w-64 bg-gray-400'
            }`}
            disabled={!emailVerified}
          >
            Next
          </Button>
        )}
      </form>
    </div>
  )
}
