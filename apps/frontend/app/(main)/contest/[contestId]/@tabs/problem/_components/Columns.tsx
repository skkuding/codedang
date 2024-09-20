'use client'

import { convertToLetter, dateFormatter } from '@/lib/utils'
import CheckIcon from '@/public/check-green.svg'
import type { ContestProblem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

export interface ContestProblemRowData extends ContestProblem {
  isVisible: null | boolean
}

export const columns: ColumnDef<ContestProblemRowData>[] = [
  {
    header: '#',
    accessorKey: 'order',
    cell: ({ row }) => (
      <div className="h-full font-medium">
        {convertToLetter(row.original.order)}
      </div>
    )
  },
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-left font-medium md:text-base">{`${row.original.title}`}</p>
      )
    }
  },
  {
    header: 'Submit',
    accessorKey: 'submit',
    cell: ({ row }) =>
      row.original.submissionTime && (
        <div className="flex items-center justify-center">
          <Image src={CheckIcon} alt="check" width={24} height={24} />
        </div>
      )
  },
  {
    header: () => 'Submission Time',
    accessorKey: 'submissionTime',
    cell: ({ row }) =>
      row.original.submissionTime &&
      dateFormatter(row.original.submissionTime, 'YYYY-MM-DD HH:mm:ss')
  },
  {
    header: () => 'Score',
    accessorKey: 'score',
    cell: ({ row }) =>
      row.original.maxScore != null ? (
        `${row.original.score ?? '-'} / ${row.original.maxScore}`
      ) : (
        <></>
      )
  }
]
