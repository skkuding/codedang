'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/libs/utils'
// import { Separator } from '@/components/ui/separator'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
// import KakaotalkLogo from '@/public/kakaotalk.svg'
import useAuthModalStore from '@/stores/authModal'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
// import { FaGithub } from 'react-icons/fa'
// import { FcGoogle } from 'react-icons/fc'
import { toast } from 'sonner'

interface Inputs {
  username: string
  password: string
}

export default function SignIn() {
  const [disableButton, setDisableButton] = useState(false)
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const { hideModal, showSignUp, showRecoverAccount } = useAuthModalStore(
    (state) => state
  )
  const router = useRouter()
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
        router.refresh()
        hideModal()
        toast.success(`Welcome back, ${data.username}!`)
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
    <div className="flex h-full w-full flex-col justify-between">
      <div className="flex justify-center pt-4">
        <Image
          className="absolute top-4"
          src={codedangLogo}
          alt="codedang"
          width={100}
        />
      </div>
      <div className="flex flex-col gap-4">
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <p className="text-primary mb-4 text-left font-mono text-xl font-bold">
            Log in
          </p>
          <Input
            placeholder="User ID"
            type="text"
            {...register('username')}
            className={cn(
              'focus-visible:ring-1',
              watch('username') && 'ring-primary ring-1'
            )}
          />
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
          <Button
            className="mt-2 w-full"
            type="submit"
            disabled={disableButton}
          >
            Log In
          </Button>
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
      <div className="flex items-center justify-between">
        <Button
          onClick={() => showSignUp()}
          variant={'link'}
          className="h-5 w-fit p-0 py-2 text-xs text-gray-500"
        >
          Sign up
        </Button>
        <Button
          onClick={() => showRecoverAccount()}
          variant={'link'}
          className="h-5 w-fit p-0 py-2 text-xs text-gray-500"
        >
          Forgot ID / password?
        </Button>
      </div>
    </div>
  )
}
