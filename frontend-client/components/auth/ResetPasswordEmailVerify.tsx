import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { baseUrl } from '@/lib/constants'
import { cn } from '@/lib/utils'
import useRecoverAccountModalStore from '@/stores/recoverAccountModal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface EmailVerifyInput {
  verificationCode: string
}

const schema = z.object({
  verificationCode: z
    .string()
    .min(6, { message: 'Code must be 6 characters long' })
    .max(6, { message: 'Code must be 6 characters long' })
})

export default function ResetPasswordEmailVerify() {
  const { nextModal, formData, setFormData } = useRecoverAccountModalStore(
    (state) => state
  )
  const {
    handleSubmit,
    register,
    getValues,
    trigger,
    formState: { errors }
  } = useForm<EmailVerifyInput>({
    resolver: zodResolver(schema)
  })
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [emailAuthToken, setEmailAuthToken] = useState<string>('')
  const [codeError, setCodeError] = useState<string>('')

  const onSubmit = (data: EmailVerifyInput) => {
    setFormData({
      email: formData.email,
      ...data,
      headers: {
        'email-auth': emailAuthToken
      }
    })
    nextModal()
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
            email: formData.email
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-1 px-2"
    >
      <p className="text-primary mb-4 text-left text-xl font-bold">
        Reset Password
      </p>
      <div className="text-sm font-semibold text-gray-500">
        {formData.email}
      </div>
      <Input
        type="number"
        className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        placeholder="Verification Code"
        {...register('verificationCode', {
          onChange: () => verifyCode()
        })}
      />
      <p className="text-xs text-red-500">
        {errors.verificationCode ? errors.verificationCode?.message : codeError}
      </p>
      {!errors.verificationCode && codeError === '' && !emailVerified && (
        <p className="text-primary text-xs">We&apos;ve sent an email!</p>
      )}
      <Button
        type="submit"
        className={cn('mb-8 mt-2 w-full', !emailVerified && 'bg-gray-400')}
        disabled={!emailVerified}
      >
        Next
      </Button>
    </form>
  )
}
