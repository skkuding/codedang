'use client'

import { InfoModal } from '@/components/auth/LogInPage/InfoModal'
import { Input } from '@/components/shadcn/input'
import codedangLogo from '@/public/logos/codedang-editor.svg'
import type { Route } from 'next'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { FaEyeSlash } from 'react-icons/fa'
import { toast } from 'sonner'
import { RecoverAccount } from '../RecoverAccount/RecoverAccount'

interface SignInInput {
  nickname: string
  password: string
}

export function LogInPage() {
  const [authView, setAuthView] = useState<'login' | 'recover'>('login')
  const [isSignInDisabled, setIsSignInDisabled] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const router = useRouter()
  const posthog = usePostHog()
  const searchParams = useSearchParams()
  const isSocialUnlinkedModalOpen =
    searchParams.get('modal') === 'social-unlinked'
  const { register, handleSubmit } = useForm<SignInInput>()

  const handleKakaoLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BASEURL}/auth/kakao`
  }

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
    <>
      <div className="relative z-30 flex min-h-[613px] w-[500px] flex-col items-start gap-8 rounded-2xl border border-[#DCE3E5] bg-white px-6 pb-9 pt-12">
        {authView === 'login' ? (
          <>
            <div className="flex w-full flex-col items-center gap-5">
              <Image
                src={codedangLogo}
                alt="codedang"
                width={71.246}
                height={35.84}
                className="h-[35.84px] w-[71.246px]"
              />
              <h1 className="text-head5_sb_24 text-center">
                코드당에 어서오세요!
              </h1>
            </div>

            <form
              className="flex w-full flex-col items-start gap-6"
              onSubmit={handleSubmit(onSubmit)}
              autoComplete="off"
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

              <div className="flex w-full flex-col gap-[10px]">
                <button
                  className="bg-primary text-sub3_sb_16 flex w-full items-center justify-center gap-[6px] rounded-xl px-5 py-[15px] text-white disabled:opacity-50"
                  type="submit"
                  disabled={isSignInDisabled}
                >
                  로그인
                </button>
              </div>
            </form>
            <div className="flex w-full items-center justify-center gap-4">
              <button
                type="button"
                className="text-caption2_m_12 text-[#787E80]"
                onClick={() => setAuthView('recover')}
              >
                Forgot ID/PW
              </button>
              <span className="h-3 w-px bg-[#D8D8D8]" />
              <Link
                href={'/signup' as Route}
                className="text-caption2_m_12 text-[#787E80]"
              >
                회원가입
              </Link>
            </div>

            <div className="border-line-normal w-full border-t" />

            <div className="flex w-full flex-col items-center gap-6">
              <p className="text-body1_m_16 text-center">
                SNS 계정으로 시작하기
              </p>

              <div className="flex items-center justify-center gap-6">
                {/* Google */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#DCE3E5] bg-white">
                    <Image
                      src="/icons/google-symbol.svg"
                      alt=""
                      width={48}
                      height={48}
                    />
                  </div>
                  <span className="text-caption2_m_12 text-[#737373]">
                    Google
                  </span>
                </button>

                {/* Kakao */}
                <button
                  type="button"
                  onClick={handleKakaoLogin}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE500]">
                    <Image
                      src="/icons/kakaotalk-symbol.svg"
                      alt=""
                      width={48}
                      height={48}
                    />
                  </div>
                  <span className="text-caption2_m_12 text-[#737373]">
                    카카오톡
                  </span>
                </button>

                {/* GitHub */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black">
                    <Image
                      src="/icons/github-symbol.svg"
                      alt=""
                      width={48}
                      height={48}
                    />
                  </div>
                  <span className="text-caption2_m_12 text-[#737373]">
                    GitHub
                  </span>
                </button>

                {/* Naver */}
                <button
                  type="button"
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#03C75A]">
                    <Image
                      src="/icons/naver-symbol.svg"
                      alt=""
                      width={48}
                      height={48}
                    />
                  </div>
                  <span className="text-caption2_m_12 text-[#737373]">
                    Naver
                  </span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-1 flex-col">
            <RecoverAccount onBackToSignIn={() => setAuthView('login')} />
          </div>
        )}
      </div>
      <InfoModal
        open={isSocialUnlinkedModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            router.replace('/login' as Route)
          }
        }}
        title={'SNS 정보를 확인했어요.\n코드당에 처음 오시네요!'}
        description="기존 회원은 로그인 후 소셜 연동이 가능해요"
        secondaryButton={{
          text: '로그인',
          onClick: () => router.replace('/login' as Route)
        }}
        primaryButton={{
          text: '회원가입 이어서하기',
          onClick: () => router.replace('/signup' as Route)
        }}
      />
    </>
  )
}
