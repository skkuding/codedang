'use client'

import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { baseUrl } from '@/lib/vars'
import CodedangLogo from '@/public/codedang.svg'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaCheck } from 'react-icons/fa'
import { FaEyeSlash } from 'react-icons/fa'
import { FaEye } from 'react-icons/fa'
import { z } from 'zod'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

interface SignUpFormInput {
  username: string
  email: string
  verificationCode: string
  realName: string
  password: string
  passwordAgain: string
}

const schema = z
  .object({
    username: z.string().min(3).max(10),
    email: z.string().email(),
    verificationCode: z.string().min(6).max(6),
    realName: z.string().min(1).max(20),
    password: z.string().min(8).max(32),
    passwordAgain: z.string().min(8).max(32)
  })
  .refine(
    (data: { password: string; passwordAgain: string }) =>
      data.password === data.passwordAgain,
    {
      message: 'Passwords do not match',
      path: ['passwordAgain']
    }
  )
  .refine(
    (data: { username: string }) => /^[a-zA-Z0-9]+$/.test(data.username),
    {
      message: 'Username can only contain alphabets and numbers',
      path: ['username']
    }
  )
  .refine((data: { realName: string }) => /^[a-zA-Z\s]+$/.test(data.realName), {
    message: 'Real name can only contain alphabets',
    path: ['realName']
  })

export default function SignUpRegister() {
  const [emailAuthToken] = useState<string>('')
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)

  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<SignUpFormInput>({
    resolver: zodResolver(schema)
  })

  const { toast } = useToast()

  const onSubmit = async (data: {
    username: string
    email: string
    realName: string
    password: string
  }) => {
    try {
      await fetch(baseUrl + '/user/sign-up', {
        method: 'POST',
        headers: {
          'email-auth': emailAuthToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          realName: data.realName,
          password: data.password
        })
      })
      toast({
        description: 'Sign up succeed!',
        className: 'text-blue-500'
      })
    } catch (error) {
      toast({
        description: 'Sign up failed!',
        className: 'text-red-500'
      })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Image src={CodedangLogo} alt="코드당" width={70} className="mb-5" />

      <form
        className="flex w-60 flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Input placeholder="Your Name" {...register('realName')} />
          {errors.realName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.realName?.message}
            </p>
          )}
        </div>
        <div>
          <div className="flex gap-1">
            <Input placeholder="User ID" {...register('username')} />
            <Button
              onClick={() => {}}
              className="flex aspect-square w-12 items-center justify-center rounded-md bg-[#2279FD]"
            >
              <FaCheck className="text-white" size="20" />
            </Button>
          </div>
          {errors.username && (
            <p className="mt-1 text-xs text-red-500">
              {errors.username?.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between gap-2">
            <Input
              className="w-52"
              placeholder="Password"
              {...register('password')}
              type={passwordShow ? 'text' : 'password'}
            />
            <span
              className="mt-3"
              onClick={() => setPasswordShow(!passwordShow)}
            >
              {passwordShow ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password?.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between gap-2">
            <Input
              className="w-52"
              {...register('passwordAgain')}
              placeholder="Re-enter password"
              type={passwordAgainShow ? 'text' : 'password'}
            />
            <span
              className="mt-3"
              onClick={() => setPasswordAgainShow(!passwordAgainShow)}
            >
              {passwordAgainShow ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.passwordAgain && (
            <p className="mt-1 text-xs text-red-500">
              {errors.passwordAgain?.message}
            </p>
          )}
        </div>

        <Button color="blue" onClick={() => {}} type="submit">
          Register
        </Button>
      </form>
      <div className="text-gray-dark mt-6 flex flex-col items-center text-sm">
        Already have an account?
        <a className="text-gray-dark hover:text-gray-dark/80 active:text-gray-dark/60 w-fit cursor-pointer text-sm underline">
          Log In
        </a>
      </div>
      <Toaster />
    </div>
  )
}

// 모달 전환하는 방식으로 수정 예정
// 모달 컴포넌트 분리 예정
