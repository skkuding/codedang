'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { baseUrl } from '@/lib/vars'
import useSignUpModalStore from '@/stores/signUpModal'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaCheck, FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'sonner'
import { z } from 'zod'

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
    username: z
      .string()
      .min(3)
      .max(10)
      .refine((data) => /^[a-z0-9]+$/.test(data)),
    realName: z
      .string()
      .min(1)
      .max(20)
      .refine((data) => /^[a-zA-Z\s]+$/.test(data)),
    password: z
      .string()
      .min(8)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      }),
    passwordAgain: z.string().min(8)
  })
  .refine(
    (data: { password: string; passwordAgain: string }) =>
      data.password === data.passwordAgain,
    {
      path: ['passwordAgain']
    }
  )

export default function SignUpRegister() {
  const formData = useSignUpModalStore((state) => state.formData)
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

  const onSubmit = async (data: {
    password: string
    passwordAgain: string
    realName: string
    username: string
  }) => {
    try {
      await fetch(baseUrl + '/user/sign-up', {
        method: 'POST',
        headers: {
          ...formData.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          email: formData.email,
          verificationCode: formData.verificationCode
        })
      }).then((res) => {
        if (res.status === 201) {
          document.getElementById('closeDialog')?.click()
          toast.success('Sign up succeed!')
        }
      })
    } catch {
      toast.error('Sign up failed!')
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
    <div className="mb-5 mt-12 flex w-full flex-col p-4">
      <form
        className="flex w-full flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <p className="text-left text-xl font-bold text-blue-500">Sign Up</p>
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
            <div className="mt-1 text-xs text-gray-500">
              <p>&#x2022; Your name must be less than 20 characters</p>
              <p>&#x2022; Your name can only contain alphabet letters</p>
            </div>
          )}
          {errors.realName && (
            <p className="mt-1 text-xs text-red-500">Unavailable</p>
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
                !disableUsername ? '' : 'bg-gray-400'
              }`}
              disabled={disableUsername}
            >
              <FaCheck className="text-white" size="20" />
            </Button>
          </div>
          {inputFocus === 2 && (
            <div className="mt-1 text-xs text-gray-500">
              <p>&#x2022; User ID used for log in</p>
              <p>
                &#x2022; Your ID must be 3-10 characters of small
                &nbsp;&nbsp;&nbsp;&nbsp;alphabet letters, numbers
              </p>
            </div>
          )}
          {errors.username ? (
            <p className="mt-1 text-xs text-red-500">Unavailable</p>
          ) : (
            usernameVerify &&
            (disableUsername ? (
              <p className="mt-1 text-xs text-blue-500">Available</p>
            ) : (
              <p className="mt-1 text-xs text-red-500">Unavailable</p>
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
              {passwordShow ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </span>
          </div>
          {inputFocus === 3 && (
            <div
              className={`${
                !errors.password ? 'text-gray-500' : 'text-red-500'
              } mt-1 text-xs`}
            >
              <p>&#x2022; Your password must be at least 8 characters</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;and include two of the followings:</p>
              <p>
                &nbsp;&nbsp;&nbsp;&nbsp;Capital letters, Small letters, or
                Numbers
              </p>
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
              {passwordAgainShow ? (
                <FaEye className="text-gray-400" />
              ) : (
                <FaEyeSlash className="text-gray-400" />
              )}
            </span>
          </div>
          {errors.passwordAgain && (
            <p className="mt-1 text-xs text-red-500">Incorrect</p>
          )}
        </div>

        <Button
          disabled={!isValid || !disableUsername}
          className={`${isValid && disableUsername ? '' : 'bg-gray-400'}`}
          type="submit"
        >
          Register
        </Button>
      </form>
    </div>
  )
}
