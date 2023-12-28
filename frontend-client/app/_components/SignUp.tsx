'use client'

import { baseUrl } from '@/lib/vars'
import CodedangLogo from '@/public/codedang.svg'
import Image from 'next/image'
import React, { useState } from 'react'
import { IoMdArrowBack } from 'react-icons/io'
import { Button } from '../../components/ui/button'
import SignUpEmailVerify from './SignUpEmailVerify'
import SignUpWelcome from './SignUpWelcome'

export default function SignUp() {
  const [modalPage, setModalPage] = useState(0)
  const [formData, setFormData] = useState(null)

  const nextModal = () => {
    setModalPage(modalPage + 1)
  }

  const backModal = () => {
    setModalPage(modalPage - 1)
    console.log('data is ', formData)
  }

  const onSubmit = async () => {
    try {
      await fetch(baseUrl + '/user/sign-up', {
        method: 'POST',
        // headers: {
        //   'email-auth': emailAuthToken,
        //   'Content-Type': 'application/json'
        // },
        //header는 formData에 포함됨
        body: JSON.stringify(formData)
      })
      //Sign up succeed!
    } catch (error) {
      //Sign up failed!
    }
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
        alt="코드당"
        width={70}
        className="absolute left-10 top-10"
      />

      {modalPage === 0 && <SignUpWelcome nextModal={nextModal} />}
      {modalPage === 1 && (
        <>
          <SignUpEmailVerify
            nextModal={nextModal}
            formData={formData}
            setFormData={setFormData}
          />
        </>
      )}
      {modalPage === 2 && (
        <div>
          {/* SignUpRegister */}
          <Button
            type="submit"
            onClick={() => {
              console.log('final data is ', formData)
              onSubmit()
            }}
          >
            Register
          </Button>
        </div>
      )}
      <div className="flex items-center text-sm text-gray-500">
        Already have an account?
        <a className="ml-5 w-fit cursor-pointer text-sm underline hover:text-black active:text-black">
          Log In
        </a>
      </div>
    </div>
  )
}
