'use client'

import { ErrorBoundaryFallbackProps } from '@suspensive/react'
import { useRouter } from 'next/navigation'
import { startTransition, useState } from 'react'
import { RiAlertFill } from 'react-icons/ri'
import { Button } from './shadcn/button'

export default function FetchErrorFallback({
  error,
  reset
}: ErrorBoundaryFallbackProps) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)

  console.log(error)

  const handleRetry = () => {
    setIsResetting(true)

    startTransition(() => {
      router.refresh()
      reset()
      setIsResetting(false)
    })
  }
  return (
    <div className="flex w-full flex-col items-center py-6">
      <RiAlertFill className="text-gray-300" size={42} />
      <p className="text-2xl font-bold">Failed to load data</p>
      <Button
        onClick={() => handleRetry()}
        disabled={isResetting}
        className="mt-2"
      >
        Retry
      </Button>
    </div>
  )
}
