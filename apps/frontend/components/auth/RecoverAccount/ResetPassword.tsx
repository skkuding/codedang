import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn, fetcher } from '@/libs/utils'
import { useRecoverAccountModalStore } from '@/stores/recoverAccountModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'sonner'
import * as v from 'valibot'

interface ResetPasswordInput {
  password: string
  passwordAgain: string
}

const schema = (t: (key: string) => string) =>
  v.pipe(
    v.object({
      password: v.pipe(
        v.string(),
        v.minLength(8),
        v.maxLength(20),
        v.check((value) => {
          const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
          return !invalidPassword.test(value)
        })
      ),
      passwordAgain: v.string()
    }),
    v.forward(
      v.partialCheck(
        [['password'], ['passwordAgain']],
        (input) => input.password === input.passwordAgain,
        t('incorrect')
      ),
      ['passwordAgain']
    )
  )

export function ResetPassword() {
  const { t } = useTranslate()
  const {
    handleSubmit,
    register,
    trigger,
    getValues,
    watch,
    formState: { errors, isValid }
  } = useForm<ResetPasswordInput>({
    resolver: valibotResolver(schema(t))
  })
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)
  const [inputFocus, setInputFocus] = useState<number>(0)
  const [focusedList, setFocusedList] = useState<Array<boolean>>([false, false])
  const { formData } = useRecoverAccountModalStore((state) => state)

  const watchedPassword = watch('password')
  const watchedPasswordAgain = watch('passwordAgain')

  useEffect(() => {
    if (watchedPasswordAgain) {
      trigger('passwordAgain')
    }
  }, [watchedPassword, watchedPasswordAgain, trigger])

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      const response = await fetcher.patch('user/password-reset', {
        headers: formData.headers,
        json: {
          newPassword: data.password
        }
      })
      if (response.ok) {
        document.getElementById('closeDialog')?.click()
        toast.success(t('password_reset_success'))
      }
    } catch {
      toast.error(t('password_reset_fail'))
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-1 px-2"
    >
      <p className="text-primary mb-4 text-left font-mono text-xl font-bold">
        {t('reset_password_title')}
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="relative flex justify-between gap-1">
            <Input
              placeholder={t('password_placeholder')}
              className={cn(
                focusedList[0] && 'ring-1 focus-visible:ring-1',
                errors.password && getValues('password')
                  ? 'ring-red-500 focus-visible:ring-red-500'
                  : 'ring-primary'
              )}
              {...register('password', {
                onChange: () => trigger('password')
              })}
              type={passwordShow ? 'text' : 'password'}
              onFocus={() => {
                setInputFocus(0)
                setFocusedList([true, focusedList[1]])
              }}
            />
            <span
              className="absolute right-0 top-0 flex h-full p-3"
              onClick={() => setPasswordShow(!passwordShow)}
            >
              {passwordShow ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </span>
          </div>
          {(inputFocus === 0 || errors.password) && (
            <div
              className={cn(
                errors.password && getValues('password')
                  ? 'text-red-500'
                  : 'text-gray-500',
                'text-xs'
              )}
            >
              <ul className="pl-4 text-xs">
                <li className="list-disc">{t('password_requirements_1')}</li>
                <li className="list-disc">{t('password_requirements_2')}</li>
                <li>{t('password_requirements_3')}</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="relative flex justify-between gap-1">
            <Input
              className={cn(
                focusedList[1] && 'ring-1 focus-visible:ring-1',
                errors.passwordAgain && getValues('passwordAgain')
                  ? 'ring-red-500 focus-visible:ring-red-500'
                  : 'ring-primary'
              )}
              {...register('passwordAgain', {
                onChange: () => trigger('passwordAgain')
              })}
              placeholder={t('reenter_password_placeholder')}
              type={passwordAgainShow ? 'text' : 'password'}
              onFocus={() => {
                setInputFocus(1)
                setFocusedList([focusedList[0], true])
              }}
            />
            <span
              className="absolute right-0 top-0 flex h-full p-3"
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
            <p className="text-xs text-red-500">
              {errors.passwordAgain.message}
            </p>
          )}
        </div>
        <Button
          disabled={!isValid}
          className={cn(!isValid && 'bg-gray-400')}
          type="submit"
        >
          {t('save_button')}
        </Button>
      </div>
    </form>
  )
}
