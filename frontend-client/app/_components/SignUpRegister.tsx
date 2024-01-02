'use client'

import { useToast } from '@/components/ui/use-toast'
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

interface FormData {
  email: string
  verificationCode: string
  headers: {
    'Content-Type': string
    'email-auth': string
  }
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

export default function SignUpRegister({ formData }: { formData: FormData }) {
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [passwordAgainShow, setPasswordAgainShow] = useState<boolean>(false)
  const [inputFocus, setInputFocus] = useState<number>(0)
  const [disableUsername, setDisableUsername] = useState<boolean>(false)
  const [usernameVerify, setUsernameVerify] = useState<boolean>(false)

  const {
    handleSubmit,
    register,
    getValues,
    trigger,
    formState: { errors, isValid }
  } = useForm<SignUpFormInput>({
    resolver: zodResolver(schema)
  })

  const { toast } = useToast()

  const onSubmit = async (data: {
    password: string
    passwordAgain: string
    realName: string
    username: string
  }) => {
    try {
      await fetch(baseUrl + '/user/sign-up', {
        method: 'POST',
        headers: formData.headers,
        body: JSON.stringify({
          ...data,
          email: formData.email,
          verificationCode: formData.verificationCode
        })
      }).then((res) => {
        if (res.status === 201) {
          document.getElementById('closeDialog')?.click()
          toast({
            className:
              'top-0 right-0 fixed md:max-w-[420px] md:top-4 md:right-4 text-blue-500',
            title: 'Sign up succeed!',
            duration: 3000
          })
        }
      })
    } catch {
      toast({
        title: 'Sign up failed!',
        className:
          'top-0 right-0 fixed md:max-w-[420px] md:top-4 md:right-4 absolute top-0 right-0 text-red-500',
        duration: 3000
      })
    }
  }
  const validation = async (field: string) => {
    await trigger(field as keyof SignUpFormInput)
  }

  const checkUserName = async () => {
    const { username } = getValues()
    await trigger('username')
    if (!errors.username) {
      try {
        await fetch(baseUrl + `/user/username-check?username=${username}`, {
          method: 'GET'
        }).then((res) => {
          setUsernameVerify(true)

          if (res.status === 200) {
            setDisableUsername(true)
          } else {
            setDisableUsername(false)
          }
        })
      } catch (err) {
        console.log(err)
      }
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
            placeholder="Your name"
            {...register('realName', {
              onChange: () => validation('realName')
            })}
            onFocus={() => {
              setInputFocus(1)
            }}
          />
          {inputFocus === 1 && (
            <div>
              <div className="mt-1 text-xs text-slate-500">
                <p>&#x2022; Your name must be less than 20 characters</p>
                <p>&#x2022; Your name can only contain alphabet letters</p>
              </div>
            </div>
          )}
          {errors.realName && (
            <p className="mt-1 text-xs text-red-500">*Unavailable</p>
          )}
        </div>

        <div>
          <div className="flex gap-2">
            <Input
              placeholder="User ID"
              disabled={disableUsername}
              {...register('username', {
                onChange: () => validation('username')
              })}
              onFocus={() => {
                setInputFocus(2)
              }}
            />
            <Button
              onClick={() => checkUserName()}
              type="button"
              className={`flex aspect-square w-12 items-center justify-center rounded-md ${
                !disableUsername ? 'bg-[#2279FD]' : 'bg-[#C4CBCD]'
              }`}
              disabled={disableUsername}
            >
              <FaCheck className="text-white" size="20" />
            </Button>
          </div>
          {inputFocus === 2 && (
            <div>
              <div className="mt-1 text-xs text-slate-500">
                <p>&#x2022; User ID used for log in</p>
                <p>
                  &#x2022; Your ID must be 3-10 characters of alphabet
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;letters, numbers
                </p>
              </div>
            </div>
          )}
          {errors.username ? (
            <p className="mt-1 text-xs text-red-500">*Unavailable</p>
          ) : (
            usernameVerify &&
            (disableUsername ? (
              <p className="mt-1 text-xs text-blue-500">*Available</p>
            ) : (
              <p className="mt-1 text-xs text-red-500">*Unavailable</p>
            ))
          )}
        </div>

        <div>
          <div className="flex justify-between gap-2">
            <Input
              placeholder="Password"
              {...register('password', {
                onChange: () => validation('password')
              })}
              type={passwordShow ? 'text' : 'password'}
              onFocus={() => {
                setInputFocus(3)
              }}
            />
            <span
              className="mt-3"
              onClick={() => setPasswordShow(!passwordShow)}
            >
              {passwordShow ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {inputFocus === 3 && (
            <div
              className={`${
                !errors.password ? 'text-slate-500' : 'text-red-500'
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
              {...register('passwordAgain', {
                onChange: () => validation('passwordAgain')
              })}
              placeholder="Re-enter password"
              type={passwordAgainShow ? 'text' : 'password'}
              onFocus={() => {
                setInputFocus(4)
              }}
            />
            <span
              className="mt-3"
              onClick={() => setPasswordAgainShow(!passwordAgainShow)}
            >
              {passwordAgainShow ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.passwordAgain && (
            <p className="mt-1 text-xs text-red-500">*Incorrect</p>
          )}
        </div>

        <Button
          disabled={!isValid}
          className={`${isValid ? 'bg-[#2279FD]' : 'bg-[#C4CBCD]'}`}
          type="submit"
        >
          Register
        </Button>
      </form>
    </div>
  )
}
