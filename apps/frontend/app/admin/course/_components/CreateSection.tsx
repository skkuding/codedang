'use client'

import { TableCell, TableRow } from '@/components/shadcn/table'
import CopyPlus from '@/public/icons/copy-plus.svg'
import { CornerDownRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CreateSection({ courseCode }: { courseCode: string }) {
  const router = useRouter()

  return (
    <TableRow className="border-0 hover:bg-transparent">
      <TableCell colSpan={6} className="p-0 md:pb-0 md:pt-1">
        <button
          type="button"
          onClick={() => {
            router.push('/')
          }}
          className="rounded-xs bg-color-blue-95 flex w-full items-center gap-[38px] px-14 py-[13px] text-left hover:bg-blue-100/70"
        >
          <CornerDownRight className="size-4 shrink-0 stroke-2" />
          <span className="flex gap-2">
            <CopyPlus className="text-color-cool-neutral-50 size-5 shrink-0" />
            <span className="text-body4_r_14">
              {`'${courseCode}'에 분반 추가하기`}
            </span>
          </span>
        </button>
      </TableCell>
    </TableRow>
  )
}
