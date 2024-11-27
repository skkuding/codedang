'use client'

import { dateFormatter } from '@/libs/utils'
import checkIcon from '@/public/icons/check-gray.svg'
import type { FinishedContest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

export const columns: ColumnDef<FinishedContest>[] = [
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
          <Image src={checkIcon} alt="check" height={24} />
        </div>
      )
  },
  {
    header: 'Participants',
    accessorKey: 'participants',
    cell: ({ row }) => row.original.participants
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
