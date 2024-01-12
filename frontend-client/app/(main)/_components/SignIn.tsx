'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import CodedangLogo from '@/public/codedang.svg'
import KakaotalkLogo from '@/public/kakaotalk.svg'
import useAuthModalStore from '@/stores/authModal'
import Image from 'next/image'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

export default function SignIn() {
  const { showSignUp } = useAuthModalStore((state) => state)
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="mb-8 flex justify-center py-4">
        <Image src={CodedangLogo} alt="코드당" height={64} />
      </div>
      <form
        className="flex w-full flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Input placeholder="ID" type="text" id="username" />
        <Input placeholder="Password" type="password" id="password" />
        <Button className="w-full" type="submit">
          Sign In
        </Button>
      </form>
      <div className="mb-1 mt-4 flex items-center justify-center gap-5">
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
      <div className="mt-12 flex items-center justify-between">
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
