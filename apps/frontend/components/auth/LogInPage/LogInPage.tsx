'use client'

import { Input } from '@/components/shadcn/input'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { Route } from 'next'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { FaEyeSlash } from 'react-icons/fa'
import { toast } from 'sonner'

interface SignInInput {
  nickname: string
  password: string
}

export function LogInPage() {
  const [isSignInDisabled, setIsSignInDisabled] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const router = useRouter()
  const posthog = usePostHog()
  const { register, handleSubmit } = useForm<SignInInput>()

  const onSubmit: SubmitHandler<SignInInput> = async (data) => {
    setIsSignInDisabled(true)
    try {
      const res = await signIn('credentials', {
        nickname: data.nickname,
        password: data.password,
        redirect: false
      })
      if (!res?.error) {
        posthog.identify(data.nickname)
        router.push('/')
        router.refresh()

        toast.success(`Welcome back, ${data.nickname}!`, {
          style: {
            transform: 'translateY(30px)'
          }
        })
      } else {
        toast.error('Failed to log in')
      }
    } catch (error) {
      console.error('Error during login:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSignInDisabled(false)
    }
  }

  return (
    <div className="flex w-[500px] flex-col items-start gap-8 rounded-2xl border border-[#DCE3E5] bg-white px-6 pb-9 pt-12">
      <div className="flex w-full flex-col items-center gap-5">
        <Image
          src={codedangLogo}
          alt="codedang"
          width={71.246}
          height={35.84}
          className="h-[35.84px] w-[71.246px]"
        />
        <h1 className="text-head5_sb_24 text-center">코드당에 어서오세요!</h1>
      </div>

      <form
        className="flex w-full flex-col items-start gap-6"
        onSubmit={handleSubmit(onSubmit)}
        aria-label="Login In"
      >
        <div className="flex w-full flex-col gap-[6px]">
          <Input
            placeholder="아이디"
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="username"
            {...register('nickname')}
          />
          <div className="relative">
            <Input
              placeholder="영문자, 숫자 포함 8-20자 (특수문자 제외)"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="current-password"
              type={isPasswordVisible ? 'text' : 'password'}
              {...register('password')}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-5 flex items-center"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
            >
              <FaEyeSlash className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          <button
            className="bg-primary text-sub3_sb_16 flex w-full items-center justify-center gap-[6px] rounded-xl px-5 py-[15px] text-white"
            type="submit"
            disabled={isSignInDisabled}
          >
            로그인
          </button>
          <Link href={'/signup' as Route} className="w-full">
            <button
              type="button"
              className="border-primary text-sub3_sb_16 text-primary flex w-full items-center justify-center gap-[6px] rounded-xl border bg-white px-5 py-[15px]"
            >
              회원가입
            </button>
          </Link>
        </div>
      </form>
    </div>
  )
}
