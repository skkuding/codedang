'use client'

import { dateFormatter } from '@/libs/utils'
import checkIcon from '@/public/icons/check-darkgray.svg'
import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

export const columns: ColumnDef<Contest>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => (
      <p
        className={`overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm md:text-base ${
          row.original.status === 'ongoing' ||
          row.original.status === 'registeredOngoing'
            ? 'text-primary-strong font-semibold'
            : ''
        }`}
      >
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
    header: 'Period',
    accessorKey: 'period',
    cell: ({ row }) => (
      <p className={row.original.status === 'ongoing' ? 'font-semibold' : ''}>
        {dateFormatter(row.original.startTime, 'YYYY-MM-DD')} ~
        {dateFormatter(row.original.endTime, 'YYYY-MM-DD')}
      </p>
    )
  }
]
