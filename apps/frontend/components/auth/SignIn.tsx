'use client'

import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
// import { Separator } from '@/components/ui/separator'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
// import KakaotalkLogo from '@/public/kakaotalk.svg'
import { useAuthModalStore } from '@/stores/authModal'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
// import { FaGithub } from 'react-icons/fa'
// import { FcGoogle } from 'react-icons/fc'
import { toast } from 'sonner'
import { IDLabel, PasswordLabel } from './AuthLabel'

interface Inputs {
  username: string
  password: string
}

export function SignIn() {
  const [disableButton, setDisableButton] = useState(false)
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const { hideModal, showRecoverAccount } = useAuthModalStore((state) => state)
  const router = useRouter()
  const posthog = usePostHog()

  const { register, handleSubmit, watch } = useForm<Inputs>()
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setDisableButton(true)
    try {
      const res = await signIn('credentials', {
        username: data.username,
        password: data.password,
        redirect: false
      })
      if (!res?.error) {
        posthog.identify(data.username) // Set new distinct ID
        router.refresh()
        hideModal()
        toast.success(`Welcome back, ${data.username}!`, {
          style: {
            transform: 'translateY(30px)'
          }
        })
      } else {
        toast.error('Failed to log in')
      }
    } catch (error) {
      console.error('Error during login:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setDisableButton(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <Image
        className="mb-15 mt-10 w-[140px]"
        src={codedangLogo}
        alt="codedang"
      />
      <form
        className="flex h-full w-full flex-col justify-between"
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Log in"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[6px]">
            <IDLabel />
            <Input
              placeholder="User ID"
              type="text"
              {...register('username')}
              className={cn(
                'focus-visible:ring-1',
                watch('username') && 'ring-primary ring-1'
              )}
            />
          </div>
          <div className="flex flex-col gap-[6px]">
            <PasswordLabel />
            <div className="relative flex justify-between gap-1">
              <Input
                placeholder="Password"
                type={passwordShow ? 'text' : 'password'}
                {...register('password')}
                className={cn(
                  'focus-visible:ring-1',
                  watch('password') && 'ring-primary ring-1'
                )}
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
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Button
            onClick={showRecoverAccount}
            variant={'link'}
            className="text-color-neutral-70 text-sm font-normal underline"
          >
            Forgot ID / Password
          </Button>
          <Button className="w-full" type="submit" disabled={disableButton}>
            Log In
          </Button>
        </div>
      </form>
      {/* <div className="flex items-center justify-center gap-5">
          <Separator className="flex-1" />
          <p className="w-fit flex-none text-center text-xs text-gray-500">
            OR continue with
          </p>
          <Separator className="flex-1" />
        </div> */}
      {/* <div className="flex w-full items-center justify-center gap-5">
          <div className="flex aspect-square w-12 cursor-pointer items-center justify-center rounded-full bg-[#FEE500] hover:opacity-80">
            <Image src={KakaotalkLogo} alt="카카오톡" width={20} />
          </div>
          <div className="flex aspect-square w-12 cursor-pointer items-center justify-center rounded-full bg-[#EEEEEE] hover:opacity-80">
            <FcGoogle size="22" />
          </div>
          <div className="flex aspect-square w-12 cursor-pointer items-center justify-center rounded-full bg-[#212528] hover:opacity-80">
            <FaGithub className="text-white" size="22" />
          </div>
        </div> */}
    </div>
    // </div>
  )
}
