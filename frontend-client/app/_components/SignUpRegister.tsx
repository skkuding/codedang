'use client'

import { baseUrl } from '@/lib/vars'
import { zodResolver } from '@hookform/resolvers/zod'
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

interface Header {
  ContentType: string
  emailAuth: string
}

interface FormData {
  email: string
  verificationCode: string
  headers: Header
}

const schema = z
  .object({
    username: z.string().min(3).max(10),
    realName: z.string().min(1).max(20),
    password: z.string().min(8).max(20),
    passwordAgain: z.string().min(8).max(20)
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

export default function SignUpRegister({
  formData,
  setFormData
}: {
  formData: FormData
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setFormData: any
}) {
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)
  const [realNameFocus, setRealNameFocus] = useState<boolean>(false)
  const [userNameFocus, setUserNameFocus] = useState<boolean>(false)
  const [passwordFocus, setPasswordFocus] = useState<boolean>(false)
  const [passwordAgainFocus, setPasswordAgainFocus] = useState<boolean>(false)
  const [realNameValid, setRealNameValid] = useState<boolean>(false)
  const [userNameValid, setUserNameValid] = useState<boolean>(false)
  const [passwordValid, setPasswordValid] = useState<boolean>(false)
  const [passwordAgainValid, setPasswordAgainValid] = useState<boolean>(false)

  const { handleSubmit, register, getValues } = useForm<SignUpFormInput>({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: {
    password: string
    passwordAgain: string
    realName: string
    username: string
  }) => {
    setFormData({
      ...formData,
      ...data
    })
    try {
      await fetch(baseUrl + '/user/sign-up', {
        method: 'POST',
        headers: formData.headers,
        body: JSON.stringify({
          email: formData.email,
          password: data.password,
          passwordAgain: data.passwordAgain,
          realName: data.realName,
          username: data.username,
          verificationCode: formData.verificationCode
        })
      }).then((res) => console.log('res is ', res))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="mb-5 mt-16 flex w-full flex-col p-4">
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <p className="mb-2 text-left text-xl font-bold text-blue-500">
            Sign Up
          </p>
        </div>

        <div>
          <Input
            className="px-4 shadow-md"
            placeholder="Your name"
            {...register('realName')}
            onFocus={() => {
              setRealNameFocus(true)
              setUserNameFocus(false)
              setPasswordFocus(false)
              setPasswordAgainFocus(false)
            }}
            onChange={(e) => {
              const value = e.target.value
              const isValid = /^[a-zA-Z\s]{1,20}$/.test(value)
              setRealNameValid(isValid)
            }}
          />
          {realNameFocus && (
            <div>
              <div className="mt-1 text-xs text-slate-500">
                <p>&#x2022; Your name must be less than 20 characters</p>
                <p>&#x2022; Your name can only contain alphabet letters</p>
              </div>
              {realNameValid ? (
                <p className="mt-1 text-xs text-blue-500">*Available</p>
              ) : (
                <p className="mt-1 text-xs text-red-500">*Unavailable</p>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex gap-2">
            <Input
              className="px-4 shadow-md"
              placeholder="User ID"
              {...register('username')}
              onFocus={() => {
                setRealNameFocus(false)
                setUserNameFocus(true)
                setPasswordFocus(false)
                setPasswordAgainFocus(false)
              }}
              onChange={(e) => {
                const value = e.target.value
                const isValid = /^[a-zA-Z0-9]{3,10}$/.test(value)
                setUserNameValid(isValid)
              }}
            />
            <Button
              onClick={() => {
                console.log('username: ' + getValues('username'))
              }}
              className={`flex aspect-square w-12 items-center justify-center rounded-md ${
                userNameValid ? 'bg-[#2279FD]' : 'bg-[#C4CBCD]'
              }`}
            >
              <FaCheck className="text-white" size="20" />
            </Button>
          </div>
          {userNameFocus && (
            <div>
              <div className="mt-1 text-xs text-slate-500">
                <p>&#x2022; User ID used for log in</p>
                <p>
                  &#x2022; Your ID must be 3-10 characters of alphabet
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;letters, numbers
                </p>
              </div>
              {userNameValid ? (
                <p className="mt-1 text-xs text-blue-500">*Available</p>
              ) : (
                <p className="mt-1 text-xs text-red-500">*Unavailable</p>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between gap-2">
            <Input
              className="px-4 shadow-md"
              placeholder="Password"
              {...register('password')}
              type={passwordShow ? 'text' : 'password'}
              onFocus={() => {
                setRealNameFocus(false)
                setUserNameFocus(false)
                setPasswordFocus(true)
                setPasswordAgainFocus(false)
              }}
              onChange={(e) => {
                const value = e.target.value
                const isValid = /^.{8,20}$/.test(value)
                setPasswordValid(isValid)
              }}
            />
            <span
              className="mt-3"
              onClick={() => setPasswordShow(!passwordShow)}
            >
              {passwordShow ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {passwordFocus && (
            <div
              className={`${
                passwordValid ? 'text-slate-500' : 'text-red-500'
              } mt-1 text-xs`}
            >
              <p>&#x2022; Your password must be 8-20 characters</p>
              <p>&#x2022; Include alphabet letters and numbers</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex justify-between gap-2">
            <Input
              className="px-4 shadow-md"
              {...register('passwordAgain')}
              placeholder="Re-enter password"
              type={passwordAgainShow ? 'text' : 'password'}
              onFocus={() => {
                setRealNameFocus(false)
                setUserNameFocus(false)
                setPasswordFocus(false)
                setPasswordAgainFocus(true)
              }}
              onChange={(e) => {
                const password = getValues('password')
                const passwordAgain = e.target.value
                if (password === passwordAgain) setPasswordAgainValid(true)
                else setPasswordAgainValid(false)
              }}
            />
            <span
              className="mt-3"
              onClick={() => setPasswordAgainShow(!passwordAgainShow)}
            >
              {passwordAgainShow ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {passwordAgainFocus && !passwordAgainValid && (
            <p className="mt-1 text-xs text-red-500">*Incorrect</p>
          )}
        </div>

        <Button
          disabled={
            !realNameValid ||
            !userNameValid ||
            !passwordValid ||
            !passwordAgainValid
          }
          type="submit"
        >
          Register
        </Button>
      </form>
    </div>
  )
}
