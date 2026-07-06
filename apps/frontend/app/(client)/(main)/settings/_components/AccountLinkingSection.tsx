'use client'

import Image from 'next/image'
import { toast } from 'sonner'
import { useSettingsContext } from './context'

const PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: '/icons/google.svg',
    iconSize: 32,
    bgColor: 'bg-white border border-[#d8d8d8]'
  },
  {
    id: 'kakao',
    name: '카카오톡',
    icon: '/icons/kakao.svg',
    iconSize: 28,
    bgColor: 'bg-[#fbe300]'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '/icons/github.svg',
    iconSize: 28,
    bgColor: 'bg-black'
  },
  {
    id: 'naver',
    name: 'Naver',
    icon: '/icons/naver.svg',
    iconSize: 28,
    bgColor: 'bg-[#03cf5d]'
  }
]

export function AccountLinkingSection() {
  const { defaultProfileValues } = useSettingsContext()

  const connectedProviders = new Set(
    defaultProfileValues.userOauth?.map((o) => o.provider) ?? []
  )

  const handleConnect = (providerId: string) => {
    toast.info(`${providerId} 연결 기능은 준비 중입니다.`)
  }

  const handleDisconnect = (providerId: string) => {
    toast.info(`${providerId} 연결 해제 기능은 준비 중입니다.`)
  }

  return (
    <div className="flex flex-col gap-7 rounded-2xl border border-[#dce3e5] bg-white px-6 py-7">
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
              <span className="text-base font-medium tracking-[-0.48px] text-black">
                {provider.name}
              </span>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-5">
                <span className="text-base font-normal tracking-[-0.48px] text-[#9b9b9b]">
                  연결됨
                </span>
                <button
                  type="button"
                  onClick={() => handleDisconnect(provider.id)}
                  className="text-primary h-[46px] rounded-xl border-[1.4px] border-[#619cfb] bg-white px-5 py-[13px] text-base font-semibold tracking-[-0.64px]"
                >
                  연결해제
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleConnect(provider.id)}
                className="bg-primary h-[46px] rounded-xl px-5 py-[13px] text-base font-semibold tracking-[-0.64px] text-white"
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
