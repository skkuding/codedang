'use client'

import CodedangLogo from '@/public/codedang.svg'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaPaperPlane } from 'react-icons/fa'
import { FaCheck } from 'react-icons/fa'
import { FaEyeSlash } from 'react-icons/fa'
import { FaEye } from 'react-icons/fa'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

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
  .refine((data) => data.password === data.passwordAgain, {
    message: 'Passwords do not match',
    path: ['passwordAgain']
  })
  .refine((data) => /^[a-zA-Z0-9]+$/.test(data.username), {
    message: 'Username can only contain alphabets and numbers',
    path: ['username']
  })
  .refine((data) => /^[a-zA-Z\s]+$/.test(data.realName), {
    message: 'Real name can only contain alphabets',
    path: ['realName']
  })

const SignUp = () => {
  const [sentEmail, setSentEmail] = useState<boolean>(false)
  const [emailVerified, setEmailVerified] = useState<boolean>(false)
  const [emailAuthToken, setEmailAuthToken] = useState<string>('')
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)

  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<SignUpFormInput>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data) => {
    try {
      await axios.post(
        '/api/user/sign-up',
        {
          username: data.username,
          email: data.email,
          realName: data.realName,
          password: data.password
        },
        { headers: { 'email-auth': emailAuthToken } }
      )
    } catch (error) {
      console.log('submit error is ', error)
    }
  }

  const sendCodeToEmail = async (email) => {
    if (!sentEmail) {
      try {
        await axios.post('/api/email-auth/send-email/register-new', {
          email: email
        })
        setSentEmail(true)
      } catch (error) {
        console.log('send code to email error is ', error)
      }
    } else {
      //TODO: toast already sent email, wanna re-send?
    }
  }

  const verifyCode = async (email, verificationCode) => {
    if (!emailVerified) {
      try {
        const response = await axios.post('/api/email-auth/verify-pin', {
          pin: verificationCode,
          email: email
        })
        if (response.status === 200) {
          setEmailVerified(true)
          setEmailAuthToken(response.headers['email-auth'])
        } else {
          // TODO: handle failure
        }
      } catch (error) {
        console.log('verify code error is ', error)
      }
    } else {
      //TODO: email already verified
    }
  }

  return (
    <div class="flex flex-col items-center justify-center">
      <Image src={CodedangLogo} alt="코드당" width={70} className="mb-5" />

      <form class="flex w-60 flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="User Id" {...register('username')} />
        {errors.username && <p>{errors.username.message}</p>}
        <div class="flex gap-2">
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            {...register('email')}
          />
          <button color="blue" onClick={() => sendCodeToEmail()} />
          <div className="flex aspect-square w-12 items-center justify-center rounded-md bg-[#2279FD]">
            <FaPaperPlane className="text-white" size="20" />
          </div>
          {errors.email && <p>{errors.email.message}</p>}
        </div>
        {sentEmail && (
          <p class="text-green text-xs font-bold">
            Email verification code has been sent!
          </p>
        )}
        <div class="flex gap-2">
          <Input
            type="number"
            placeholder="Verification Code"
            {...register('verificationCode')}
          />
          <button color="blue" onClick={() => verifyCode()} />
          <div className="flex aspect-square w-12 items-center justify-center rounded-md bg-[#2279FD]">
            <FaCheck className="text-white" size="20" />
          </div>
          {errors.verificationCode && <p>{errors.verificationCode.message}</p>}
        </div>
        {emailVerified && (
          <p class="text-green text-xs font-bold">Email has been verified!</p>
        )}
        <Input placeholder="Real Name" {...register('realName')} />
        {errors.realName && <p>{errors.realName.message}</p>}

        <div class="flex items-center justify-between gap-2">
          <Input
            placeholder="Password"
            {...register('password')}
            type={passwordShow ? 'text' : 'password'}
          />
          <span onClick={() => setPasswordShow(!passwordShow)}>
            {passwordShow ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.password && <p>{errors.password.message}</p>}

        <div class="flex items-center justify-between gap-2">
          <Input
            {...register('passwordAgain')}
            placeholder="Password Check"
            type={passwordAgainShow ? 'text' : 'password'}
          />
          <span onClick={() => setPasswordAgainShow(!passwordAgainShow)}>
            {passwordAgainShow ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.passwordAgain && <p>{errors.passwordAgain.message}</p>}
        <Button color="blue" onClick={() => {}} type="submit">
          Register
        </Button>
      </form>
      <div class="text-gray-dark mt-6 flex flex-col items-center text-sm">
        Already have an account?
        <a class="text-gray-dark hover:text-gray-dark/80 active:text-gray-dark/60 w-fit cursor-pointer text-sm underline">
          Log In
        </a>
      </div>
    </div>
  )
}

export default SignUp
