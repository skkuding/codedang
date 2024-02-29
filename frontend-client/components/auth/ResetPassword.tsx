import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { baseUrl } from '@/lib/constants'
import { cn } from '@/lib/utils'
import useRecoverAccountModalStore from '@/stores/recoverAccountModal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'sonner'
import { z } from 'zod'

interface ResetPasswordInput {
  password: string
  passwordAgain: string
}

const schema = z
  .object({
    password: z
      .string()
      .min(8)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      }),
    passwordAgain: z.string().min(8)
  })
  .refine(
    (data: { password: string; passwordAgain: string }) =>
      data.password === data.passwordAgain,
    {
      path: ['passwordAgain']
    }
  )

export default function ResetPassword() {
  const {
    handleSubmit,
    register,
    trigger,
    formState: { errors, isValid }
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(schema)
  })
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)
  const [inputFocus, setInputFocus] = useState<number>(0)
  const { formData } = useRecoverAccountModalStore((state) => state)

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      const response = await fetch(baseUrl + '/user/password-reset', {
        method: 'PATCH',
        headers: {
          ...formData.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPassword: data.password
        }),
        credentials: 'include'
      })
      if (response.ok) {
        document.getElementById('closeDialog')?.click()
        toast.success('Password reset successfully')
      }
    } catch {
      toast.error('Password reset failed')
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-2">
            <Input
              placeholder="Password"
              {...register('password', {
                onChange: () => trigger('password')
              })}
              type={passwordShow ? 'text' : 'password'}
              onFocus={() => {
                setInputFocus(0)
              }}
            />
            <span
              className="flex items-center"
              onClick={() => setPasswordShow(!passwordShow)}
            >
              {passwordShow ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </span>
          </div>
          {inputFocus === 0 && (
            <div
              className={cn(
                errors.password ? 'text-red-500' : 'text-gray-500',
                'text-xs'
              )}
            >
              <ul className="pl-4">
                <li className="list-disc">
                  Your password must be at least 8 characters
                </li>
                <li>and include two of the followings:</li>
                <li>Capital letters, Small letters, or Numbers</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between gap-2">
            <Input
              {...register('passwordAgain', {
                onChange: () => trigger('passwordAgain')
              })}
              placeholder="Re-enter password"
              type={passwordAgainShow ? 'text' : 'password'}
              onFocus={() => {
                setInputFocus(1)
              }}
            />
            <span
              className="flex items-center"
              onClick={() => setPasswordAgainShow(!passwordAgainShow)}
            >
              {passwordAgainShow ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </span>
          </div>
          {errors.passwordAgain && (
            <p className="text-xs text-red-500">Incorrect</p>
          )}
        </div>
        <Button
          disabled={!isValid}
          className={cn(!isValid && 'bg-gray-400')}
          type="submit"
        >
          Save
        </Button>
      </div>
    </form>
  )
}
