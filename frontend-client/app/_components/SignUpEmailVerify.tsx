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
  email: z.string().email(),
  verificationCode: z.string().min(6).max(6)
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
    formState: { errors }
  } = useForm<EmailVerifyInput>({
    resolver: zodResolver(schema)
  })
  const [sentEmail, setSentEmail] = useState<boolean>(false)
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [emailAuthToken, setEmailAuthToken] = useState<string>('') //TODO: submit시 헤더에 포함시켜야함.
  const onSubmit = (data: any) => {
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
    if (!sentEmail) {
      await fetch(baseUrl + '/email-auth/send-email/register-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email
        })
      })
        .then((res) => {
          if (res.status === 409) {
            //'You have already signed up!',
          } else if (res.status === 201) {
            setSentEmail(true)
          }
        })
        .catch((err) => {
          console.log(err)
        })
    } else {
      //email already sent!
    }
  }
  const verifyCode = async () => {
    const { email } = getValues()
    const { verificationCode } = getValues()

    try {
      const response = await fetch(baseUrl + '/email-auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: verificationCode,
          email: email
        })
      })
      if (response.status === 200) {
        setEmailVerified(true)
        setEmailAuthToken(response.headers.get('email-auth') || '')
      } else {
        //'Verification code is not valid!',
      }
    } catch (error) {
      //'Email verification failed!'
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="email"
        type="email"
        placeholder="Email Address"
        {...register('email')}
      />
      {errors.email && (
        <p className="mt-1 text-xs text-red-500">{errors.email?.message}</p>
      )}
      <Input
        type="number"
        placeholder="Verification Code"
        {...register('verificationCode')}
      />
      {errors.verificationCode && (
        <p className="mt-1 text-xs text-red-500">
          {errors.verificationCode?.message}
        </p>
      )}

      {sentEmail ? (
        <Button onClick={() => sendEmail()}>Send Email</Button>
      ) : (
        <Button onClick={() => verifyCode()}>Next</Button>
      )}
      {sentEmail && emailVerified && <Button type="submit">Next</Button>}
    </form>
  )
}
