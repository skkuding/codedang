'use client'

import { Button } from '@/components/shadcn/button'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import type { Route } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { IoWarningOutline } from 'react-icons/io5'

export function UpdateInformation() {
  const router = useRouter()
  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="flex justify-center pt-4">
        <Image
          className="absolute top-4"
          src={codedangLogo}
          alt="codedang"
          width={100}
        />
      </div>
      <div className="mt-20 inline-flex items-center text-center font-mono text-xl font-bold text-red-500">
        <IoWarningOutline />
        <p className="pl-2">Update Information</p>
      </div>
      <div className="my-6 flex flex-col gap-2 text-center text-xs text-neutral-700">
        <p>
          You <span className="font-bold">must update below information</span>
        </p>
        <p>to continue using our service (~ 2024-10-31).</p>
      </div>
      <ul className="flex flex-col gap-2 text-xs font-medium text-neutral-700">
        <li className="list-disc">Student ID</li>
        <li className="list-disc">First Major</li>
      </ul>
      <Button
        className="mt-8 w-full bg-red-500 font-semibold hover:bg-red-600"
        onClick={() => {
          router.push(
            (`/settings` +
              `?${new URLSearchParams({ updateNow: 'true' })}`) as Route
          )
        }}
      >
        Update Now
      </Button>
    </div>
  )
}
