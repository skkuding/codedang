'use client'

import { Button } from '@/components/ui/button'
import CodedangLogo from '@/public/codedang.svg'
import useAuthModalStore from '@/stores/authModal'
import useRecoverAccountModalStore from '@/stores/recoverAccountModal'
import Image from 'next/image'
import { IoMdArrowBack } from 'react-icons/io'
import FindUserId from './FindUserId'
import ResetPassword from './ResetPassword'

export default function RecoverAccount() {
  const { showSignUp, showSignIn } = useAuthModalStore((state) => state)
  const { modalPage, backModal } = useRecoverAccountModalStore((state) => state)

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <button
        onClick={modalPage === 0 ? showSignIn : backModal}
        className="absolute left-4 top-4 h-4 w-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400"
      >
        <IoMdArrowBack />
      </button>

      <Image
        className="absolute left-8 top-10"
        src={CodedangLogo}
        alt="codedang"
        width={70}
      />

      {modalPage === 0 && <FindUserId />}
      {modalPage === 1 && <ResetPassword />}

      <div className="absolute bottom-6 flex items-center justify-center">
        <Button
          onClick={() => showSignUp()}
          variant={'link'}
          className="h-5 w-fit p-0 py-2 text-xs text-gray-500"
        >
          Register now
        </Button>
      </div>
    </div>
  )
}
