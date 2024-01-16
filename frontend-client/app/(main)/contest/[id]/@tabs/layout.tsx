'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRouter, usePathname } from 'next/navigation'
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
  const pathname = usePathname()

  const isCurrentTab = (tab: string) => {
    if (tab === '') return pathname === `/contest/${id}`
    return pathname.startsWith(`/contest/${id}/${tab}`)
  }

  return (
    <>
      <div className="flex justify-center gap-2 border-b border-b-gray-200">
        <Button
          variant={'link'}
          onClick={() => {
            router.push(`/contest/${id}`)
          }}
          className={cn(
            'rounded-none border-b-2 border-b-white',
            isCurrentTab('') && 'border-green-500'
          )}
        >
          Top
        </Button>
        <Button
          variant={'link'}
          onClick={() => {
            router.push(`/contest/${id}/problem`)
          }}
          className={cn(
            'rounded-none border-b-2 border-b-white',
            isCurrentTab('problem') && 'border-green-500'
          )}
        >
          Problem
        </Button>
        <Button
          variant={'link'}
          onClick={() => {
            router.push(`/contest/${id}/clarification`)
          }}
          className={cn(
            'rounded-none border-b-2 border-b-white',
            isCurrentTab('clarification') && 'border-green-500'
          )}
        >
          Clarification
        </Button>
        <Button
          variant={'link'}
          onClick={() => {
            router.push(`/contest/${id}/standings`)
          }}
          className={cn(
            'rounded-none border-b-2 border-b-white',
            isCurrentTab('standings') && 'border-green-500'
          )}
        >
          Standings
        </Button>
      </div>
      {children}
    </>
  )
}
