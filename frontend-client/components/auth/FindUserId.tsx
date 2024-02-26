import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn, fetcher } from '@/lib/utils'
import useAuthModalStore from '@/stores/authModal'
import useRecoverAccountModalStore from '@/stores/recoverAccountModal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

interface FindUserIdInput {
  email: string
}
const schema = z.object({
  email: z.string().email({ message: 'Invalid email address' })
})

export default function FindUserId() {
  const [userId, setUserId] = useState<string>('')
  const [emailError, setEmailError] = useState<string>('')
  const [sentEmail, setSentEmail] = useState<boolean>(false)
  const { nextModal, setFormData } = useRecoverAccountModalStore(
    (state) => state
  )
  const { showSignIn } = useAuthModalStore((state) => state)

  const {
    handleSubmit,
    register,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<FindUserIdInput>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FindUserIdInput) => {
    const { email } = data
    try {
      const data: { username: string } = await fetcher
        .get('user/email', {
          searchParams: { email }
        })
        .json()
      if (data.username) {
        setUserId(data.username)
        setEmailError('')
      } else setEmailError('* No account confirmed with this email')
    } catch {
      setEmailError('* No account confirmed with this email')
    }
  }

  const sendEmail = async () => {
    const { email } = getValues()
    setFormData({
      email,
      verificationCode: '',
      headers: {
        'email-auth': ''
      }
    })
    await trigger('email')
    if (!errors.email && !sentEmail) {
      await fetcher
        .post('email-auth/send-email/password-reset', {
          json: { email }
        })
        .then((res) => {
          if (res.status === 401) {
            setEmailError(
              'Email authentication pin is sent to your email address'
            )
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-8 px-2"
    >
      <div className="flex flex-col gap-1">
        <p className="text-primary mb-4 text-left text-xl font-bold">
          Find User ID
        </p>
        <Input
          id="email"
          type="email"
          placeholder="Email Address"
          {...register('email', {
            onChange: () => trigger('email')
          })}
          disabled={!!userId}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email?.message}</p>
        )}
        <p className="text-xs text-red-500">{emailError}</p>
        {userId ? (
          <p className="text-center text-sm text-gray-500">
            your User ID is <span className="text-primary">{userId}</span>
          </p>
        ) : (
          <p className="text-center text-sm text-gray-300">
            your User ID is ___________
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {userId ? (
          <Button onClick={() => showSignIn()} type="button">
            Log in
          </Button>
        ) : (
          <Button type="submit">Find User ID</Button>
        )}
        <Button
          type="button"
          onClick={() => {
            sendEmail()
              .then(() => {
                nextModal()
              })
              .catch(() => {
                console.log('error')
              })
          }}
          className={cn(!userId && 'bg-gray-400')}
          disabled={!userId}
        >
          Reset Password
        </Button>
      </div>
    </form>
  )
}
