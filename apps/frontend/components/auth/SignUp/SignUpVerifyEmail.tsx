import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn, safeFetcher } from '@/libs/utils'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { AuthMessage } from '../AuthMessage'
import { SignUpApi } from './api'

interface VerifyEmailInput {
  verificationCode: string
}

const schema = v.object({
  verificationCode: v.pipe(
    v.string(),
    v.length(6, 'Code must be 6 characters long')
  )
})

const TIME_LIMIT = 300

export function SignUpVerifyEmail() {
  const [endTime, setEndTime] = useState(() => Date.now() + TIME_LIMIT * 1000)
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.round((endTime - Date.now()) / 1000))
  )

  const [codeExpired, setCodeExpired] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const [emailAuthToken, setEmailAuthToken] = useState('')

  const {
    handleSubmit,
    register,
    getValues,
    trigger,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<VerifyEmailInput>({
    resolver: valibotResolver(schema)
  })

  useEffect(() => {
    if (codeExpired || emailVerified) {
      return
    }
    const id = setInterval(() => {
      const rem = Math.max(0, Math.round((endTime - Date.now()) / 1000))
      setRemaining(rem)
      if (rem === 0) {
        setCodeExpired(true)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [codeExpired, emailVerified])

  const renderTimer = () => {
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const onSubmit = (data: VerifyEmailInput) => {
    setFormData({
      ...formData,
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
        const response = await safeFetcher.post(`email-auth/verify-pin`, {
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
          clearErrors('verificationCode')
          setEmailAuthToken(response.headers.get('email-auth') || '')
        } else {
          setError('verificationCode', {
            message: 'Verification code is not valid'
          })
          setEmailVerified(false)
        }
      } catch {
        setEmailVerified(false)
        setError('verificationCode', {
          message: 'Email verification failed'
        })
      }
    }
  }

  function renderFormHeader() {
    return (
      <>
        <p className="text-xl font-medium">We’ve Sent an Email</p>
        <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
          Please check your inbox{' '}
          <span className="text-primary">{formData.email}</span>
        </p>
      </>
    )
  }

  function renderFormBody() {
    return (
      <div>
        <div className="relative">
          <Input
            type="number"
            disabled={emailVerified}
            className={cn(
              'hide-spin-button',
              (errors.verificationCode || codeExpired) &&
                'border-red-500 focus-visible:border-red-500'
            )}
            placeholder="Verification Code"
            {...register('verificationCode', {
              onChange: verifyCode
            })}
          />
          {!codeExpired && (
            <span
              className={cn(
                'absolute right-[14px] top-2',
                emailVerified ? 'text-color-neutral-70' : 'text-error'
              )}
            >
              {renderTimer()}
            </span>
          )}
        </div>
        {codeExpired ? (
          <div className="flex flex-col gap-[2px]">
            <AuthMessage
              type={'error'}
              message={'Verification code expired.'}
            />
            <AuthMessage
              type={'error'}
              message={'Please resend an email and try again.'}
            />
          </div>
        ) : (
          <div>
            {(() => {
              if (errors.verificationCode?.message) {
                return (
                  <AuthMessage
                    type={'error'}
                    message={errors.verificationCode?.message}
                  />
                )
              }
              if (emailVerified) {
                return (
                  <AuthMessage
                    type={'success'}
                    message={'Verification code is valid'}
                  />
                )
              }
            })()}
          </div>
        )}
      </div>
    )
  }

  function renderFormFooter() {
    return (
      <div className="text-color-neutral-50 flex flex-col gap-[12.5px] text-sm font-normal">
        {(() => {
          if (!codeExpired || emailVerified) {
            return (
              <Button
                type="submit"
                className={cn('w-full text-base font-medium')}
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
                setCodeExpired(false)
                setRemaining(TIME_LIMIT)
                setEndTime(Date.now() + TIME_LIMIT * 1000)
                SignUpApi.sendEmail(formData.email)
              }}
            >
              Resend Email
            </Button>
          )
        })()}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full flex-col justify-between"
    >
      <div>
        {renderFormHeader()}
        {renderFormBody()}
      </div>
      {renderFormFooter()}
    </form>
  )
}
