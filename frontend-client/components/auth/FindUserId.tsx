import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetcher } from '@/lib/utils'
import useAuthModalStore from '@/stores/authModal'
import useRecoverAccountModalStore from '@/stores/recoverAccountModal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { GrReturn } from 'react-icons/gr'
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
  const { nextModal } = useRecoverAccountModalStore((state) => state)
  const { showSignIn } = useAuthModalStore((state) => state)

  const {
    handleSubmit,
    register,
    trigger,
    formState: { errors }
  } = useForm<FindUserIdInput>({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    trigger('email')
  }, [trigger])

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <div>
        <p className="mb-4 text-left text-xl font-bold text-blue-500">
          Find User ID
        </p>
        <div className="flex gap-2">
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            {...register('email', {
              onChange: () => trigger('email')
            })}
          />
          <Button
            type="submit"
            className="flex aspect-square w-12 items-center justify-center rounded-md p-0"
            disabled={!!errors.email}
          >
            <GrReturn size="24" />
          </Button>
        </div>
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
          <Button onClick={() => showSignIn()}>Log in</Button>
        ) : (
          <Button type="submit">Find User ID</Button>
        )}
        <Button className="w-64" onClick={() => nextModal()} disabled={!userId}>
          Reset Password
        </Button>
      </div>
    </form>
  )
}
