'use client'

import { Button } from '@/components/ui/button'
import CodedangLogo from '@/public/codedang.svg'
import type { Route } from 'next'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { IoWarningOutline } from 'react-icons/io5'

export default function UpdateInformation() {
  const router = useRouter()
  return (
    <div className="flex w-full flex-col items-center gap-1">
      <div className="flex justify-center pt-4">
        <Image
          className="absolute top-4"
          src={CodedangLogo}
          alt="codedang"
          width={100}
        />
      </div>
      <div className="mt-12 inline-flex items-center text-center font-mono text-xl font-bold text-red-500">
        <IoWarningOutline />
        <p className="pl-2">Update Information</p>
      </div>
      <div className="mt-5 text-center text-xs text-neutral-700">
        <p>You</p>
        <p className="text-bold">must update below information</p>
        <p>to continue using our service (~ 2024-10-31).</p>
      </div>
      <div className="my-8 w-36 border-b" />
      <ul className="mt-1 text-xs font-medium text-neutral-700">
        <li>Your Student ID</li>
        <li>Your First Major</li>
      </ul>
      <Button
        className="mt-10 w-full bg-red-500 font-semibold hover:bg-red-600"
        onClick={() => {
          router.push(
            ('/settings' +
              '?' +
              new URLSearchParams({ updateNow: 'true' })) as Route
          )
        }}
      >
        Update Now
      </Button>
    </div>
  )
}
