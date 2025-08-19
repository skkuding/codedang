'use client'

import { Progress } from '@/components/shadcn/progress'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { IoMdArrowBack } from 'react-icons/io'
import { SignUpRegisterAccount } from './SignUpRegisterAccount'
import { SignUpRegisterInfo } from './SignUpRegisterInfo'
import { SignUpVerifyEmail } from './SignUpVerifyEmail'
import { SignUpWelcome } from './SignUpWelcome'

export function SignUp() {
  const { modalPage, backModal } = useSignUpModalStore((state) => state)

  return (
    <div className="flex h-full flex-col">
      {modalPage !== 0 && (
        <button
          onClick={backModal}
          className="rounded-xs focus:outline-hidden absolute left-4 top-4 h-4 w-4 opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400"
        >
          <IoMdArrowBack />
        </button>
      )}

      {modalPage !== 4 && (
        <Progress
          value={((modalPage + 1) / 4) * 100}
          className="mb-[50px] h-1"
        />
      )}

      {modalPage === 0 && <SignUpRegisterAccount />}
      {modalPage === 1 && <SignUpVerifyEmail />}
      {modalPage === 2 && <SignUpRegisterAccount />}
      {modalPage === 3 && <SignUpRegisterInfo />}
      {modalPage === 4 && <SignUpWelcome />}
    </div>
  )
}
