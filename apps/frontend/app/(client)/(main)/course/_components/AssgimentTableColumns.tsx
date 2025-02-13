'use client'

import { dateFormatter } from '@/libs/utils'
import checkIcon from '@/public/icons/check-gray.svg'
import type { Assignment } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

export const columns: ColumnDef<Assignment>[] = [
  {
    header: 'Week',
    accessorKey: 'week',
    cell: ({ row }) => (
      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm md:text-base">
        {row.original.title}
      </p>
    )
  },
  {
    header: 'Start Date',
    accessorKey: 'startDate',
    cell: ({ row }) =>
      `${dateFormatter(row.original.startTime, 'YYYY-MM-DD-HH:MM')}`
  },
  {
    header: 'End Date',
    accessorKey: 'endDate',
    cell: ({ row }) =>
      `${dateFormatter(row.original.endTime, 'YYYY-MM-DD-HH:MM')}`
  },
  {
    header: 'Progress',
    accessorKey: 'progress',
    cell: ({ row }) =>
      row.original.isRegistered && ( //FIX: 이건 3/3 형식으로 아래 있는 Assignment중 몇개 완료했는지 표시하는 것으로 나중에 바꾸어야함.
        <div className="flex items-center justify-center">
          <Image src={checkIcon} alt="check" height={24} />
        </div>
      )
  }
]
