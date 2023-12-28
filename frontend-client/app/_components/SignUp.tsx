'use client'

import { baseUrl } from '@/lib/vars'
import CodedangLogo from '@/public/codedang.svg'
import Image from 'next/image'
import React, { useState } from 'react'
// import { FaPaperPlane } from 'react-icons/fa'
// import { FaCheck } from 'react-icons/fa'
// import { FaEyeSlash } from 'react-icons/fa'
// import { FaEye } from 'react-icons/fa'
import { Button } from '../../components/ui/button'
// import { Input } from '../../components/ui/input'
import SignUpEmailVerify from './SignUpEmailVerify'
import SignUpWelcome from './SignUpWelcome'

/* eslint-disable @typescript-eslint/no-explicit-any */

// interface SignUpFormInput {
//   username: string
//   email: string
//   verificationCode: string
//   realName: string
//   password: string
//   passwordAgain: string
// }

// const schema = z
//   .object({
//     username: z.string().min(3).max(10),
//     email: z.string().email(),
//     verificationCode: z.string().min(6).max(6),
//     realName: z.string().min(1).max(20),
//     password: z.string().min(8).max(32),
//     passwordAgain: z.string().min(8).max(32)
//   })
//   .refine(
//     (data: { password: string; passwordAgain: string }) =>
//       data.password === data.passwordAgain,
//     {
//       message: 'Passwords do not match',
//       path: ['passwordAgain']
//     }
//   )
//   .refine(
//     (data: { username: string }) => /^[a-zA-Z0-9]+$/.test(data.username),
//     {
//       message: 'Username can only contain alphabets and numbers',
//       path: ['username']
//     }
//   )
//   .refine((data: { realName: string }) => /^[a-zA-Z\s]+$/.test(data.realName), {
//     message: 'Real name can only contain alphabets',
//     path: ['realName']
//   })

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

  // const saveData = (data: any) => {
  //   // 데이터를 저장하거나 다른 처리 수행
  //   setFormData(data)
  //   console.log('data is', formData)
  // }
  // const [passwordShow, setPasswordShow] = useState<boolean>(false)
  // const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)

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

// 모달 전환하는 방식으로 수정 예정
// 모달 컴포넌트 분리 예정
