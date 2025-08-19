import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { baseUrl } from '@/libs/constants'
import { cn } from '@/libs/utils'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as v from 'valibot'
import { SignUpApi } from './api'

interface VerifyEmailInput {
  emailId: string
  emailDomain: string
  verificationCode: string
}

const schema = v.object({
  verificationCode: v.pipe(
    v.string(),
    v.length(6, 'Code must be 6 characters long')
  )
})

const timeLimit = 300

export function SignUpVerifyEmail() {
  const [timer, setTimer] = useState(timeLimit)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousTimeRef = useRef(Date.now())

  const [expired, setExpired] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const { nextModal, setFormData, formData } = useSignUpModalStore(
    (state) => state
  )
  const {
    handleSubmit,
    register,
    getValues,
    trigger,
    formState: { errors }
  } = useForm<VerifyEmailInput>({
    resolver: valibotResolver(schema)
  })
  const email = `${formData.emailId}@${formData.emailDomain}`
  const [codeError, setCodeError] = useState<string>('')
  const [emailAuthToken, setEmailAuthToken] = useState<string>('')

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

  const onSubmit = (data: VerifyEmailInput) => {
    setFormData({
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
        const response = await fetch(`${baseUrl}/email-auth/verify-pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            pin: verificationCode,
            email
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
      className="mt-[50px] flex h-full flex-col justify-between"
    >
      <div>
        <p className="text-xl font-medium">We’ve Sent an Email</p>
        <p className="text-color-neutral-70 mb-[30px] text-sm font-normal">
          Please check an email to <span className="text-primary">{email}</span>
        </p>
        <div className="relative">
          <Input
            type="number"
            className={cn(
              'hide-spin-button',
              'focus-visible:border-primary w-full rounded-full focus-visible:ring-0',
              (errors.verificationCode || expired || codeError) &&
                'border-red-500 focus-visible:border-red-500'
            )}
            placeholder="Verification Code"
            {...register('verificationCode', {
              onChange: () => verifyCode()
            })}
          />
          {!expired && (
            <span className="text-error absolute right-[14px] top-2">
              {formatTimer()}
            </span>
          )}
        </div>
        {expired ? (
          <p className="text-error mt-1 text-xs">
            Verification code expired
            <br />
            Please resend an email and try again
          </p>
        ) : (
          <p className="text-error mt-1 text-xs">
            {errors.verificationCode
              ? errors.verificationCode?.message
              : codeError}
          </p>
        )}
      </div>

      <div className="text-color-neutral-50 flex flex-col gap-[12.5px] text-sm font-normal">
        {(() => {
          if (!expired) {
            return (
              <Button
                type="submit"
                className={cn(
                  'w-full text-base font-medium',
                  (!emailVerified || Boolean(errors.verificationCode)) &&
                    'bg-gray-400'
                )}
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
                setExpired(false)
                setTimer(timeLimit)
                SignUpApi.sendEmail(email)
              }}
            >
              Resend Email
            </Button>
          )
        })()}
      </div>
    </form>
  )
}
