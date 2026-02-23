import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn, fetcher, safeFetcher } from '@/libs/utils'
import { useRecoverAccountModalStore } from '@/stores/recoverAccountModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'

interface EmailVerifyInput {
  verificationCode: string
}

const schema = (t: (key: string) => string) =>
  v.object({
    verificationCode: v.pipe(
      v.string(),
      v.length(6, t('code_must_be_6_characters_long'))
    )
  })

const timeLimit = 300

export function ResetPasswordEmailVerify() {
  const { t } = useTranslate()
  const [timer, setTimer] = useState(timeLimit)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousTimeRef = useRef(Date.now())
  const [expired, setExpired] = useState(false)
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
    resolver: valibotResolver(schema(t))
  })
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [emailAuthToken, setEmailAuthToken] = useState<string>('')
  const [codeError, setCodeError] = useState<string>('')
  const [inputFocused, setInputFocused] = useState<boolean>(false)

  useEffect(() => {
    if (!expired) {
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
  }, [expired])

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

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

  const resendEmail = async () => {
    const email = formData.email

    try {
      await safeFetcher.post('email-auth/send-email/password-reset', {
        json: { email }
      })
      setExpired(false)
      setTimer(timeLimit)
    } catch {
      toast.error(t('failed_to_resend_email'))
    }
  }

  const verifyCode = async () => {
    const { verificationCode } = getValues()
    await trigger('verificationCode')
    if (!errors.verificationCode && !expired) {
      try {
        const response = await fetcher.post('email-auth/verify-pin', {
          json: {
            pin: verificationCode,
            email: formData.email
          },
          credentials: 'include'
        })
        if (response.status === 201) {
          setEmailVerified(true)
          setCodeError('')
          setEmailAuthToken(response.headers.get('email-auth') || '')
        } else {
          setCodeError(t('verification_code_is_not_valid'))
        }
      } catch {
        setCodeError(t('email_verification_failed'))
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-1 px-2"
    >
      <p className="text-primary mb-4 text-left font-mono text-xl font-bold">
        {t('reset_password')}
      </p>
      <div className="flex justify-between">
        <div className="text-sm text-black">{formData.email}</div>
        {!expired && <p className="text-red-500">{formatTimer()}</p>}
      </div>
      <Input
        type="number"
        className={cn(
          'hide-spin-button',
          inputFocused && 'ring-1 focus-visible:ring-1 disabled:ring-0',
          errors.verificationCode || codeError
            ? 'ring-red-500 focus-visible:ring-red-500'
            : 'focus-visible:ring-primary'
        )}
        placeholder={t('verification_code')}
        {...register('verificationCode', {
          onChange: () => verifyCode()
        })}
        onFocus={() => setInputFocused(true)}
      />
      {!expired && !errors.verificationCode && !codeError && !emailVerified && (
        <p className="text-primary mt-1 text-xs">{t('we_sent_an_email')}</p>
      )}
      {expired && (
        <p className="mt-1 text-xs text-red-500">
          {t('verification_code_expired')}
          <br />
          {t('please_resend_email_and_try_again')}
        </p>
      )}
      {!expired && (
        <p className="mt-1 text-xs text-red-500">
          {errors.verificationCode
            ? errors.verificationCode?.message
            : codeError}
        </p>
      )}
      {!expired ? (
        <Button
          type="submit"
          className={cn('mb-8 mt-4 w-full', !emailVerified && 'bg-gray-400')}
          disabled={!emailVerified}
        >
          {t('next')}
        </Button>
      ) : (
        <Button
          type="button"
          className="mt-4 w-full font-semibold"
          onClick={resendEmail}
        >
          {t('resend_email')}
        </Button>
      )}
    </form>
  )
}
