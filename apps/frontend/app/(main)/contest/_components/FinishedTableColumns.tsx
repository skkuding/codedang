'use client'

import { dateFormatter } from '@/lib/utils'
import CheckIcon from '@/public/check_blue.svg'
import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

export const columns: ColumnDef<Contest>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => (
      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm md:text-base">
        {row.original.title}
      </p>
    )
  },
  {
    header: 'Registered',
    accessorKey: 'registered',
    cell: ({ row }) =>
      row.original.isRegistered && (
        <div className="flex items-center justify-center">
          <Image src={CheckIcon} alt="check" height={24} />
        </div>
      )
  },
  {
    header: 'Participants',
    accessorKey: 'participants',
    cell: ({ row }) => row.original.participants
  },
  {
    header: 'Total score',
    accessorKey: 'totalScore',
    cell: () => '000/000'
  },
  {
    header: 'Period',
    accessorKey: 'period',
    cell: ({ row }) =>
      dateFormatter(row.original.startTime, 'YYYY-MM-DD') +
      ' ~ ' +
      dateFormatter(row.original.endTime, 'YYYY-MM-DD')
  }
]
