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
      <div className="mb-1 flex justify-center gap-4">
        <Button
          variant={'link'}
          onClick={() => {
            router.push(`/contest/${id}`)
          }}
          className={cn(
            'text-lg text-gray-400',
            isCurrentTab('') && 'text-primary'
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
            'text-lg text-gray-400',
            isCurrentTab('problem') && 'text-primary'
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
            'text-lg text-gray-400',
            isCurrentTab('clarification') && 'text-primary'
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
            'text-lg text-gray-400',
            isCurrentTab('standings') && 'text-primary'
          )}
        >
          Standings
        </Button>
      </div>
      {children}
    </>
  )
}
