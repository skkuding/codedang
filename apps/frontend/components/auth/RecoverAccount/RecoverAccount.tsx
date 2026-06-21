'use client'

import codedangLogo from '@/public/logos/codedang-with-text.svg'
import { useRecoverAccountModalStore } from '@/stores/recoverAccountModal'
import Image from 'next/image'
import { IoMdArrowBack } from 'react-icons/io'
import { FindUserId } from './FindUserId'
import { ResetPassword } from './ResetPassword'
import { ResetPasswordEmailVerify } from './ResetPasswordEmailVerify'

interface RecoverAccountProps {
  onBackToSignIn: () => void
}

export function RecoverAccount({ onBackToSignIn }: RecoverAccountProps) {
  const { modalPage, backModal } = useRecoverAccountModalStore((state) => state)

  return (
    <div className="mt-8 flex h-full flex-col items-center justify-center">
      <button
        type="button"
        onClick={modalPage === 0 ? onBackToSignIn : backModal}
        className="rounded-xs focus:outline-hidden absolute left-4 top-4 h-4 w-4 opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400"
      >
        <IoMdArrowBack />
      </button>
      <Image
        className="absolute top-4"
        src={codedangLogo}
        alt="codedang"
        width={100}
      />

      {modalPage === 0 && <FindUserId />}
      {modalPage === 1 && <ResetPasswordEmailVerify />}
      {modalPage === 2 && <ResetPassword />}
    </div>
  )
}
