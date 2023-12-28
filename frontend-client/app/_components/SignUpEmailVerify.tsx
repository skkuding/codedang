/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseUrl } from '@/lib/vars'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

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

export default function SignUpEmailVerify({
  nextModal,
  formData,
  setFormData
}: {
  nextModal: any
  formData: any
  setFormData: any
}) {
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
  const [codeError, setCodeError] = useState<string>('')
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [emailAuthToken, setEmailAuthToken] = useState<string>('')
  const onSubmit = (data: any) => {
    console.log('email auth is ', emailAuthToken)
    setFormData({
      ...formData,
      ...data,
      headers: {
        'email-auth': emailAuthToken,
        'Content-Type': 'application/json'
      }
    })
    nextModal()
  }
  const sendEmail = async () => {
    const { email } = getValues()
    console.log('sentEmail is ', sentEmail, 'email is ', email)
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
        .catch((err) => {
          console.log(err)
          setEmailError('Something went wrong!')
        })
    }
  }
  const verifyCode = async () => {
    const { email } = getValues()
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
            email: email
          })
        })
        if (response.status === 201) {
          setEmailVerified(true)
          setEmailAuthToken(response.headers.get('email-auth') || '')
        } else {
          setCodeError('Verification code is not valid!')
        }
      } catch (error) {
        setCodeError('Email verification failed!')
      }
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {!sentEmail && (
          <Input
            id="email"
            type="email"
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
            <div>email</div>
            <Input
              type="number"
              placeholder="Verification Code"
              {...register('verificationCode', {
                onChange: () => verifyCode()
              })}
            />
          </>
        )}
        {errors.verificationCode && (
          <p className="mt-1 text-xs text-red-500">
            {errors.verificationCode?.message}
          </p>
        )}
        {sentEmail && !errors.verificationCode && codeError === '' && (
          <p className="mt-1 text-xs text-blue-500">
            *We&apos;ve sent an email!
          </p>
        )}
        <p className="mt-1 text-xs text-red-500">{codeError}</p>

        {!sentEmail ? (
          <Button type="button" onClick={() => sendEmail()}>
            Send Email
          </Button>
        ) : (
          <Button type="submit" disabled={!emailVerified}>
            Next
          </Button>
        )}
      </form>
    </div>
  )
}
