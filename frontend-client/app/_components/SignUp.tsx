'use client'

import { baseUrl } from '@/lib/vars'
import CodedangLogo from '@/public/codedang.svg'
import Image from 'next/image'
import React, { useState } from 'react'
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
      <Image src={CodedangLogo} alt="코드당" width={70} className="mb-5" />
      {!(modalPage === 0) && <button onClick={backModal}>모달 뒤로가기</button>}

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
      <div className="text-gray-dark mt-6 flex flex-col items-center text-sm">
        Already have an account?
        <a className="text-gray-dark hover:text-gray-dark/80 active:text-gray-dark/60 w-fit cursor-pointer text-sm underline">
          Log In
        </a>
      </div>
    </div>
  )
}
