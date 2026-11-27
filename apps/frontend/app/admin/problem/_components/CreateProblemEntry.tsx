'use client'

import { Button } from '@/components/shadcn/button'
import Link from 'next/link'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { useProblemCreationMode } from '../_libs/useProblemCreationMode'
import { ProblemTypeSelectModal } from './ProblemTypeSelectModal'

export function CreateProblemEntry() {
  const { useMandeuldang } = useProblemCreationMode()

  const content = (
    <>
      <HiMiniPlusCircle className="mr-2 h-5 w-5" />
      <span className="text-lg">Create</span>
    </>
  )

  if (useMandeuldang) {
    return (
      <ProblemTypeSelectModal
        trigger={
          <Button variant="default" className="w-[120px]">
            {content}
          </Button>
        }
      />
    )
  }

  return (
    <Button variant="default" className="w-[120px]" asChild>
      <Link href="/admin/problem/create">{content}</Link>
    </Button>
  )
}
