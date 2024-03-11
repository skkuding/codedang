'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
// import KakaotalkLogo from '@/public/kakaotalk.svg'
import useSignUpModalStore from '@/stores/signUpModal'

// import Image from 'next/image'
// import { FaGithub } from 'react-icons/fa'
// import { FcGoogle } from 'react-icons/fc'

export default function SignUpWelcome() {
  const { nextModal } = useSignUpModalStore((state) => state)
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-xl font-semibold text-blue-500">
        &quot;Welcome to CODEDANG&quot;
      </p>
      <Button className="w-full" onClick={() => nextModal()}>
        Sign up with Email
      </Button>
      <div className="flex items-center justify-center gap-5">
        <Separator className="flex-1" />
        <p className="w-fit flex-none text-center text-xs text-gray-500">
          continue with
        </p>
        <Separator className="flex-1" />
      </div>
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
  )
}
