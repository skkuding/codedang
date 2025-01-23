'use client'

import { Button } from '@/components/shadcn/button'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import { useAuthModalStore } from '@/stores/authModal'
import { useSignUpModalStore } from '@/stores/signUpModal'
import Image from 'next/image'
import { IoMdArrowBack } from 'react-icons/io'
import { SignUpEmailVerify } from './SignUpEmailVerify'
import { SignUpRegister } from './SignUpRegister'
import { SignUpWelcome } from './SignUpWelcome'

export function SignUp() {
  const { showSignIn } = useAuthModalStore((state) => state)
  const { modalPage, backModal } = useSignUpModalStore((state) => state)

  return (
    <div className="flex h-full flex-col items-center justify-center">
      {!(modalPage === 0) && (
        <button
          onClick={backModal}
          className="rounded-xs focus:outline-hidden absolute left-4 top-4 h-4 w-4 opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400"
        >
          <IoMdArrowBack />
        </button>
      )}

      <Image
        className="absolute top-4"
        src={codedangLogo}
        alt="codedang"
        width={100}
      />

      {modalPage === 0 && <SignUpWelcome />}
      {modalPage === 1 && <SignUpEmailVerify />}
      {modalPage === 2 && <SignUpRegister />}

      {modalPage === 0 && (
        <div className="absolute bottom-6 flex items-center justify-center">
          <span className="h-5 w-fit text-xs leading-5 text-gray-500">
            Already have account?
          </span>
          <Button
            onClick={() => showSignIn()}
            variant={'link'}
            className="h-5 w-fit text-xs text-gray-500"
          >
            Log In
          </Button>
        </div>
      )}
    </div>
  )
}
