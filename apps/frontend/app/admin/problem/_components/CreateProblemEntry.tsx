'use client'

import { Button } from '@/components/shadcn/button'
import type { Route } from 'next'
import Link from 'next/link'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { useProblemCreationMode } from '../_libs/useProblemCreationMode'

export function CreateProblemEntry() {
  const { useMandeuldang } = useProblemCreationMode()
  const createHref = (
    useMandeuldang ? '/admin/problem/mandeuldang' : '/admin/problem/create'
  ) as Route

  return (
    <Button variant="default" className="w-[120px]" asChild>
      <Link href={createHref}>
        <HiMiniPlusCircle className="mr-2 h-5 w-5" />
        <span className="text-lg">Create</span>
      </Link>
    </Button>
  )
}
