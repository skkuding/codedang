'use client'

import { cn, dateFormatter, getStatusColor } from '@/libs/utils'
import checkIcon from '@/public/icons/check-blue.svg'
import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { getStatusText } from '../_libs/utils'

export const columns: ColumnDef<Contest>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => (
      <span
        className={cn(
          'overflow-hidden text-ellipsis whitespace-nowrap text-left text-base font-medium',
          row.original.status.toLowerCase().includes('upcoming') &&
            'text-primary-strong font-medium'
        )}
      >
        {row.original.title}
      </span>
    )
  },
  {
    header: 'Period',
    accessorKey: 'period',
    cell: ({ row }) => (
      <p className="text-left text-base font-normal tracking-[-0.48px] text-[#484C4D]">
        {dateFormatter(row.original.startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
        {dateFormatter(row.original.endTime, 'YYYY-MM-DD HH:mm')}
      </p>
    )
  },
  {
    header: 'State',
    accessorKey: 'status',
    cell: ({ row }) => (
      <p
        className={cn(
          `mx-auto flex h-10 w-fit items-center justify-center rounded-full border border-solid px-[22px] text-sm uppercase`,
          getStatusColor(row.original.status)
        )}
      >
        {getStatusText(row.original.status)}
      </p>
    ),
    filterFn: (row, id, value) => {
      const statuses = row.original.status
      if (!statuses?.length) {
        return false
      }
      const statusValue: string = row.getValue(id)
      const valueArray = (value as string[]).map((v) => v.toLowerCase())
      const result = valueArray.includes(statusValue)
      return result
    }
  },
  {
    header: 'Registered',
    accessorKey: 'registered',
    cell: ({ row }) =>
      row.original.isRegistered && (
        <div className="flex h-full w-full items-center justify-center">
          <Image
            src={checkIcon}
            alt="check"
            width={24}
            height={24}
            className="block"
          />
        </div>
      )
  }
]
