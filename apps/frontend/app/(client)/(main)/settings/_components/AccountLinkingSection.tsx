'use client'

import { safeFetcherWithAuth } from '@/libs/utils'
import githubIcon from '@/public/icons/github.svg'
import googleIcon from '@/public/icons/google.svg'
import kakaoIcon from '@/public/icons/kakao.svg'
import naverIcon from '@/public/icons/naver.svg'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useSettingsContext } from './context'

const PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: googleIcon,
    iconSize: 32,
    bgColor: 'bg-white border border-line'
  },
  {
    id: 'kakao',
    name: '카카오톡',
    icon: kakaoIcon,
    iconSize: 28,
    bgColor: 'bg-[#fbe300]'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: githubIcon,
    iconSize: 28,
    bgColor: 'bg-black'
  },
  {
    id: 'naver',
    name: 'Naver',
    icon: naverIcon,
    iconSize: 28,
    bgColor: 'bg-[#03cf5d]'
  }
]

export function AccountLinkingSection() {
  const { defaultProfileValues } = useSettingsContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
  const [locallyLinked, setLocallyLinked] = useState<Set<string>>(new Set())
  const [locallyUnlinked, setLocallyUnlinked] = useState<Set<string>>(new Set())
  const hasProcessed = useRef(false)

  const connectedProviders = new Set(
    [...(defaultProfileValues.linkedProviders ?? []), ...locallyLinked].filter(
      (p) => !locallyUnlinked.has(p)
    )
  )

  const oauthToken = searchParams.get('oauthToken')
  const error = searchParams.get('error')

  useEffect(() => {
    if (hasProcessed.current) {
      return
    }
    if (oauthToken) {
      hasProcessed.current = true
      const link = async () => {
        try {
          await safeFetcherWithAuth.post('auth/social-link', {
            json: { oauthToken }
          })
          toast.success('카카오 계정이 연결되었습니다')
          setLocallyLinked((prev) => new Set([...prev, 'kakao']))
        } catch {
          toast.error('계정 연결에 실패했습니다. 다시 시도해주세요')
        } finally {
          router.replace('/settings')
        }
      }
      link()
    } else if (error === 'already-linked') {
      hasProcessed.current = true
      toast.error('이미 다른 계정에 연결된 카카오 계정입니다')
      router.replace('/settings')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConnect = (providerId: string) => {
    if (providerId === 'kakao') {
      window.location.href = `${process.env.NEXT_PUBLIC_BASEURL}/auth/kakao/link`
      return
    }
    toast.info(`${providerId} 연결 기능은 준비 중입니다.`)
  }

  const handleDisconnect = async (providerId: string) => {
    if (providerId !== 'kakao') {
      toast.info(`${providerId} 연결 해제 기능은 준비 중입니다.`)
      return
    }
    setLoadingProvider(providerId)
    try {
      await safeFetcherWithAuth.delete(`auth/social-link/${providerId}`)
      toast.success('카카오 계정 연결이 해제되었습니다')
      setLocallyUnlinked((prev) => new Set([...prev, providerId]))
      setLocallyLinked((prev) => {
        const next = new Set(prev)
        next.delete(providerId)
        return next
      })
    } catch {
      toast.error('연결 해제에 실패했습니다. 다시 시도해주세요')
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className="border-color-cool-neutral-90 flex flex-col gap-7 rounded-2xl border bg-white px-6 py-7">
      {PROVIDERS.map((provider) => {
        const isConnected = connectedProviders.has(provider.id)
        return (
          <div key={provider.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative size-12">
                <div className={`size-full rounded-xl ${provider.bgColor}`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={provider.icon}
                    alt={provider.name}
                    width={provider.iconSize}
                    height={provider.iconSize}
                  />
                </div>
              </div>
              <span className="text-body1_m_16 text-black">
                {provider.name}
              </span>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-5">
                <span className="text-body3_r_16 text-color-neutral-70">
                  연결됨
                </span>
                <button
                  onClick={() => handleDisconnect(provider.id)}
                  disabled={loadingProvider === provider.id}
                  className="text-primary border-primary-light text-sub3_sb_16 h-[46px] rounded-xl border-[1.4px] bg-white px-5 py-[13px] disabled:opacity-50"
                >
                  연결해제
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleConnect(provider.id)}
                className="bg-primary text-sub3_sb_16 h-[46px] rounded-xl px-5 py-[13px] text-white"
              >
                연결하기
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
