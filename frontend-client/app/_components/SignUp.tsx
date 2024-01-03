'use client'

import { Button } from '@/components/ui/button'
import CodedangLogo from '@/public/codedang.svg'
import useAuthStore from '@/stores/auth'
import Image from 'next/image'
import React, { useState } from 'react'
import { IoMdArrowBack } from 'react-icons/io'
import SignUpEmailVerify from './SignUpEmailVerify'
import SignUpRegister from './SignUpRegister'
import SignUpWelcome from './SignUpWelcome'

export interface FormData {
  email: string
  verificationCode: string
  headers: {
    'email-auth': string
  }
}

export default function SignUp() {
  const { showSignIn } = useAuthStore((state) => state)
  const [modalPage, setModalPage] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    headers: {
      'email-auth': ''
    }
  })

  const nextModal = () => {
    setModalPage(modalPage + 1)
  }

  const backModal = () => {
    setModalPage(modalPage - 1)
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {!(modalPage === 0) && (
        <button
          onClick={backModal}
          className="absolute left-4 top-4 h-4 w-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400"
        >
          <IoMdArrowBack />
        </button>
      )}
      <Image
        src={CodedangLogo}
        alt="codedang"
        width={70}
        className="absolute left-10 top-10"
      />

      {modalPage === 0 && <SignUpWelcome nextModal={nextModal} />}
      {modalPage === 1 && (
        <SignUpEmailVerify nextModal={nextModal} setFormData={setFormData} />
      )}
      {modalPage === 2 && <SignUpRegister formData={formData} />}
      <div className="mt-4 flex items-center justify-center">
        <span className="h-5 w-fit text-xs leading-5 text-gray-500">
          Already have account?
        </span>
        <Button
          onClick={() => showSignIn()}
          variant={'link'}
          className="h-5 w-fit text-xs text-gray-500"
        >
          Sign In
        </Button>
      </div>
    </div>
  )
}
