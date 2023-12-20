'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import CodedangLogo from '@/public/codedang.svg'
import KakaotalkLogo from '@/public/kakaotalk.svg'
import Image from 'next/image'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

export default function SignIn() {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex justify-center py-4">
        <Image src={CodedangLogo} alt="코드당" height={64} />
      </div>
      <form
        className="flex w-full flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Input placeholder="User Id" id="userId" />
        <Input placeholder="Password" type="password" id="password" />
        <Button className="w-full" type="submit">
          Sign in
        </Button>
      </form>
      <div className="flex items-center justify-center gap-5">
        <Separator className="flex-1" />
        <p className="w-fit flex-1 text-center text-xs text-gray-500">
          continue with
        </p>
        <Separator className="flex-1" />
      </div>
      <div className="flex w-full items-center justify-center gap-5">
        <div className="flex aspect-square w-12 items-center justify-center rounded-full bg-[#FEE500]">
          <Image src={KakaotalkLogo} alt="카카오톡" width={20} />
        </div>
        <div className="flex aspect-square w-12 items-center justify-center rounded-full bg-[#EEEEEE]">
          <FcGoogle size="22" />
        </div>
        <div className="flex aspect-square w-12 items-center justify-center rounded-full bg-[#212528]">
          <FaGithub className="text-white" size="22" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <Button
          variant={'link'}
          className="h-5 w-fit p-0 text-xs text-gray-500"
        >
          Register now
        </Button>
        <Button
          variant={'link'}
          className="h-5 w-fit p-0 text-xs text-gray-500"
        >
          Forgot ID/Password
        </Button>
      </div>
    </div>
  )
}
