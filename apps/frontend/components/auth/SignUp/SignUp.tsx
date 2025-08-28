'use client'

import { Progress } from '@/components/shadcn/progress'
import { useSignUpModalStore } from '@/stores/signUpModal'
import { IoMdArrowBack } from 'react-icons/io'
import { SignUpRegisterAccount } from './SignUpRegisterAccount'
import { SignUpRegisterInfo } from './SignUpRegisterInfo2'
import { SignUpVerifyEmail } from './SignUpVerifyEmail'
import { SignUpWelcome } from './SignUpWelcome'

export function SignUp() {
  const { modalPage, backModal, setModalPage } = useSignUpModalStore(
    (state) => state
  )

  return (
    <div className="flex h-full flex-col pb-9 pt-[46px]">
      {modalPage > 0 && (
        <button
          onClick={() => (modalPage < 2 ? backModal() : setModalPage(0))}
          className="focus:outline-hidden absolute left-5 top-[30px] h-5 w-5 opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400"
        >
          <IoMdArrowBack />
        </button>
      )}

      {modalPage !== 3 && (
        <Progress
          value={((modalPage + 1) / 3) * 100}
          className="mb-[50px] h-1"
        />
      )}

      {modalPage === 0 && <SignUpRegisterInfo />}
      {modalPage === 1 && <SignUpVerifyEmail />}
      {modalPage === 2 && <SignUpRegisterAccount />}
      {modalPage === 3 && <SignUpWelcome />}
    </div>
  )
}
