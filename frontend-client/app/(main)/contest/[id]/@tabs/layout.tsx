'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { ContestDetailProps } from '../layout'

export default function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: ContestDetailProps['params']
}) {
  const { id } = params
  const router = useRouter()
  return (
    <>
      <div className="flex justify-center gap-2 border-b border-b-gray-200">
        <Button
          variant={'link'}
          onClick={() => {
            router.push(`/contest/${id}/top`)
          }}
        >
          Top
        </Button>
        <Button
          variant={'link'}
          onClick={() => {
            router.push(`/contest/${id}/problem`)
          }}
        >
          Problem
        </Button>
        <Button
          variant={'link'}
          onClick={() => {
            router.push(`/contest/${id}/clarification`)
          }}
        >
          Clarification
        </Button>
        <Button
          variant={'link'}
          onClick={() => {
            router.push(`/contest/${id}/standings`)
          }}
        >
          Standings
        </Button>
      </div>
      {children}
    </>
  )
}
