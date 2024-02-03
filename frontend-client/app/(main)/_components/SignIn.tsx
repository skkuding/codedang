'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import CodedangLogo from '@/public/codedang.svg'
import KakaotalkLogo from '@/public/kakaotalk.svg'
import useAuthModalStore from '@/stores/authModal'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'sonner'

interface Inputs {
  username: string
  password: string
}

export default function SignIn() {
  const { showSignUp } = useAuthModalStore((state) => state)
  const router = useRouter()
  const { register, handleSubmit } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const res = await signIn('credentials', {
      username: data.username,
      password: data.password,
      redirect: false
    })
    if (!res?.error) {
      router.refresh()
      toast.success('Successfully signed in')
    } else {
      toast.error('Failed to sign in')
    }
  }
  return (
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex justify-center pt-4">
        <Image src={CodedangLogo} alt="코드당" height={64} />
      </div>
      <div className="flex flex-col gap-4">
        <form
          className="flex w-full flex-col gap-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input placeholder="ID" type="text" {...register('username')} />
          <Input
            placeholder="Password"
            type="password"
            {...register('password')}
          />
          <Button className="w-full" type="submit">
            Sign In
          </Button>
        </form>
        <div className="flex items-center justify-center gap-5">
          <Separator className="flex-1" />
          <p className="w-fit flex-none text-center text-xs text-gray-500">
            OR continue with
          </p>
          <Separator className="flex-1" />
        </div>
        <div className="flex w-full items-center justify-center gap-5">
          <div className="flex aspect-square w-12 cursor-pointer items-center justify-center rounded-full bg-[#FEE500] hover:opacity-80">
            <Image src={KakaotalkLogo} alt="카카오톡" width={20} />
          </div>
          <div className="flex aspect-square w-12 cursor-pointer items-center justify-center rounded-full bg-[#EEEEEE] hover:opacity-80">
            <FcGoogle size="22" />
          </div>
          <div className="flex aspect-square w-12 cursor-pointer items-center justify-center rounded-full bg-[#212528] hover:opacity-80">
            <FaGithub className="text-white" size="22" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Button
          onClick={() => showSignUp()}
          variant={'link'}
          className="h-5 w-fit p-0 py-2 text-xs text-gray-500"
        >
          Sign Up
        </Button>
        <Button
          variant={'link'}
          className="h-5 w-fit p-0 py-2 text-xs text-gray-500"
        >
          Forgot ID/Password?
        </Button>
      </div>
    </div>
  )
}
