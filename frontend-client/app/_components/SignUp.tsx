'use client'

import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/components/ui/use-toast'
import { baseUrl } from '@/lib/vars'
import CodedangLogo from '@/public/codedang.svg'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaPaperPlane } from 'react-icons/fa'
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

export default function SignUp() {
  const [sentEmail, setSentEmail] = useState<boolean>(false)
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [emailAuthToken, setEmailAuthToken] = useState<string>('')
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)

  const {
    handleSubmit,
    register,
    getValues,
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
    } catch (error) {
      console.log('submit error is ', error)
    }
  }

  const sendCodeToEmail = async (email: string) => {
    if (!sentEmail) {
      console.log(email)
      try {
        await fetch(baseUrl + '/email-auth/send-email/register-new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email
          })
        })
        setSentEmail(true)
      } catch (error) {
        console.log('send code to email error is ', error)
      }
    } else {
      //TODO: toast already sent email, wanna re-send?
      toast({
        description: 'You have already sent an email'
      })
    }
  }

  const verifyCode = async (email: string, verificationCode: string) => {
    if (!emailVerified) {
      try {
        const response = await fetch(baseUrl + '/email-auth/verify-pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pin: verificationCode,
            email: email
          })
        })
        if (response.status === 200) {
          setEmailVerified(true)
          setEmailAuthToken(response.headers.get('email-auth') || '')
        } else {
          // TODO: handle failure
        }
      } catch (error) {
        console.log('verify code error is ', error)
      }
    } else {
      //TODO: email already verified
      toast({
        description: 'You have already verified code'
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
        <Input
          placeholder="User Id"
          {...register('username')}
          error={errors.username?.message}
        />
        <div>
          <div className="flex gap-2">
            <Input
              id="email"
              type="email"
              placeholder="Email Address"
              {...register('email')}
              error={errors.email?.message}
            />
            <Button
              onClick={() => {
                const { email } = getValues()
                sendCodeToEmail(email)
              }}
              className="flex aspect-square w-12 items-center justify-center rounded-md bg-[#2279FD]"
            >
              <FaPaperPlane className="text-white" size="20" />
            </Button>
          </div>
          {sentEmail && (
            <p className="mt-1 text-xs text-green-500">
              Email verification code has been sent!
            </p>
          )}
        </div>

        <div className="flex gap-1">
          <Input
            type="number"
            placeholder="Verification Code"
            {...register('verificationCode')}
            error={errors.verificationCode?.message}
          />
          <Button
            onClick={() => {
              const { email } = getValues()
              const { verificationCode } = getValues()
              verifyCode(email, verificationCode)
            }}
            className="flex aspect-square w-12 items-center justify-center rounded-md bg-[#2279FD]"
          >
            <FaCheck className="text-white" size="20" />
          </Button>
        </div>
        {emailVerified && (
          <p className="text-green text-xs font-bold">
            Email has been verified!
          </p>
        )}
        <Input
          placeholder="Real Name"
          {...register('realName')}
          error={errors.realName?.message}
        />

        <div className="flex justify-between gap-2">
          <Input
            className="w-52"
            placeholder="Password"
            {...register('password')}
            type={passwordShow ? 'text' : 'password'}
            error={errors.password?.message}
          />
          <span className="mt-3" onClick={() => setPasswordShow(!passwordShow)}>
            {passwordShow ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="flex justify-between gap-2">
          <Input
            className="w-52"
            {...register('passwordAgain')}
            placeholder="Password Check"
            type={passwordAgainShow ? 'text' : 'password'}
            error={errors.passwordAgain?.message}
          />
          <span
            className="mt-3"
            onClick={() => setPasswordAgainShow(!passwordAgainShow)}
          >
            {passwordAgainShow ? <FaEyeSlash /> : <FaEye />}
          </span>
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
