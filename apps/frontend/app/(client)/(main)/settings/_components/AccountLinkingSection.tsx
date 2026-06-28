'use client'

import { toast } from 'sonner'
import { useSettingsContext } from './context'

const PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path
          d="M29.44 16.318c0-1.01-.082-1.984-.235-2.921H16v5.527h7.545a6.45 6.45 0 0 1-2.797 4.232v3.518h4.527c2.649-2.44 4.165-6.034 4.165-10.356Z"
          fill="#4285F4"
        />
        <path
          d="M16 30c3.78 0 6.952-1.254 9.27-3.393l-4.527-3.518c-1.254.84-2.857 1.336-4.743 1.336-3.647 0-6.735-2.463-7.84-5.778H3.487v3.625A14 14 0 0 0 16 30Z"
          fill="#34A853"
        />
        <path
          d="M8.16 18.647A8.424 8.424 0 0 1 7.72 16c0-.922.158-1.818.44-2.647V9.728H3.487A14.003 14.003 0 0 0 2 16c0 2.26.54 4.396 1.487 6.272l4.673-3.625Z"
          fill="#FBBC05"
        />
        <path
          d="M16 7.575c2.055 0 3.9.707 5.35 2.094l4.012-4.013C23.046 3.384 19.874 2 16 2A14 14 0 0 0 3.487 9.728l4.673 3.625C9.265 10.038 12.353 7.575 16 7.575Z"
          fill="#EA4335"
        />
      </svg>
    ),
    bgColor: 'bg-white border border-[#d8d8d8]'
  },
  {
    id: 'kakao',
    name: '카카오톡',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14 3C7.373 3 2 7.477 2 13c0 3.617 2.19 6.78 5.5 8.605L6.168 26l5.397-3.556A13.77 13.77 0 0 0 14 23c6.627 0 12-4.477 12-10S20.627 3 14 3Z"
          fill="#000"
        />
      </svg>
    ),
    bgColor: 'bg-[#fbe300]'
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14 2C7.373 2 2 7.373 2 14c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23A11.513 11.513 0 0 1 14 8.803c1.02.005 2.047.138 3.006.404 2.29-1.552 3.297-1.23 3.297-1.23.654 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C22.565 23.796 26 19.3 26 14c0-6.627-5.373-12-12-12Z"
          fill="white"
        />
      </svg>
    ),
    bgColor: 'bg-black'
  },
  {
    id: 'naver',
    name: 'Naver',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path
          d="M16.273 14.56L11.46 7H7v14h4.727V13.44L16.54 21H21V7h-4.727v7.56Z"
          fill="white"
        />
      </svg>
    ),
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
                  {provider.icon}
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
