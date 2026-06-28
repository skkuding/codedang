'use client'

import { Camera } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'
import { useSettingsContext } from './context'

export function ProfilePhotoSection() {
  const { defaultProfileValues, isLoading } = useSettingsContext()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const profileImageUrl = defaultProfileValues.userProfile?.profileImageUrl

  return (
    <div className="relative size-[160px]">
      <div className="size-full overflow-hidden rounded-full bg-[#e5e5e5]">
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
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-full bg-[#474747] text-white shadow-md hover:bg-[#2a2a2a]"
      >
        <Camera size={16} />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}
