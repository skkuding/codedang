'use client'

import Image from 'next/image'
import { useSettingsContext } from './context'

export function ProfilePhotoSection() {
  const { defaultProfileValues, isLoading } = useSettingsContext()

  const rawUrl = defaultProfileValues.userProfile?.profileImageUrl
  const profileImageUrl = rawUrl?.startsWith('dicebear:')
    ? `https://api.dicebear.com/9.x/notionists/svg?seed=${rawUrl.slice('dicebear:'.length)}`
    : rawUrl

  return (
    <div className="size-[160px]">
      <div className="bg-fill-neutral size-full overflow-hidden rounded-full">
        {!isLoading && profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt="프로필 사진"
            width={160}
            height={160}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="30" r="18" fill="#b0b0b0" />
              <path
                d="M10 72c0-16.569 13.431-30 30-30s30 13.431 30 30"
                fill="#b0b0b0"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
