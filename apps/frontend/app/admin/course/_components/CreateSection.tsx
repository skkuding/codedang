import { TableCell, TableRow } from '@/components/shadcn/table'
import { CornerDownRight, CopyPlus } from 'lucide-react'
import Link from 'next/link'

export function CreateSection({ courseCode }: { courseCode: string }) {
  return (
    <TableRow className="border-0 hover:bg-transparent">
      <TableCell colSpan={6} className="p-0">
        <Link
          href={'/'}
          className="rounded-xs bg-color-blue-95 flex w-full items-center gap-3 px-[42px] py-[13px] text-left hover:bg-blue-100/70"
        >
          <CornerDownRight className="size-4 shrink-0" />
          <CopyPlus className="text-color-cool-neutral-50 size-4 shrink-0" />
          <span className="text-body4_r_14">
            {`'${courseCode}'에 분반 추가하기`}
          </span>
        </Link>
      </TableCell>
    </TableRow>
  )
}
