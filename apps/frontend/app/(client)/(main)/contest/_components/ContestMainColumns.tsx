'use client'

import { cn, dateFormatter, getStatusColor } from '@/libs/utils'
import checkIcon from '@/public/icons/check-darkgray.svg'
import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import { getStatusText } from '../_libs/utils'

export const columns: ColumnDef<Contest>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => (
      <p
        className={cn(
          'overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm md:text-base',
          row.original.status.toLowerCase().includes('upcoming') &&
            'text-primary-strong font-semibold'
        )}
      >
        {row.original.title}
      </p>
    )
  },
  {
    header: 'State',
    accessorKey: 'status',
    cell: ({ row }) => (
      <p
        className={cn(
          `ml-0 flex h-7 w-20 items-center justify-center rounded-[14px] border border-solid md:w-[92px] xl:ml-5`,
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
        <div className="flex items-center justify-center">
          <Image src={checkIcon} alt="check" height={24} />
        </div>
      )
  },
  {
    header: 'Period',
    accessorKey: 'period',
    cell: ({ row }) => (
      <p className="text-neutral-500">
        {dateFormatter(row.original.startTime, 'YYYY-MM-DD HH:mm')} ~{' '}
        {dateFormatter(row.original.endTime, 'YYYY-MM-DD HH:mm')}
      </p>
    )
  }
]
