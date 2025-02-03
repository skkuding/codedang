'use client'

import { cn, dateFormatter } from '@/libs/utils'
import checkIcon from '@/public/icons/check-darkgray.svg'
import type { Contest } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

const getStatusText = (status: string) => {
  if (status.toLowerCase().includes('ongoing')) {
    return 'Ongoing'
  } else if (status.toLowerCase().includes('upcoming')) {
    return 'Upcoming'
  } else {
    return 'Finished'
  }
}

const getStatusColor = (status: string) => {
  if (status.toLowerCase().includes('upcoming')) {
    return 'text-primary border-primary'
  } else if (status.toLowerCase().includes('ongoing')) {
    return 'text-[#737373] border-[#3333334D]'
  } else {
    return 'text-[#3333334D] border-[#80808040]'
  }
}

export const columns: ColumnDef<Contest>[] = [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => (
      <p
        className={cn(
          `overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm md:text-base`,
          row.original.status.toLowerCase().includes('upcoming') &&
            'text-primary-strong font-semibold'
        )}
      >
        {row.original.title}
      </p>
    )
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => (
      <p
        className={cn(
          `ml-0 flex h-7 w-20 items-center justify-center rounded-[14px] border border-solid font-medium md:w-[92px] xl:ml-5`,
          getStatusColor(row.original.status)
        )}
      >
        {getStatusText(row.original.status)}
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
      <p className={row.original.status === 'upcoming' ? 'font-semibold' : ''}>
        {dateFormatter(row.original.startTime, 'YYYY-MM-DD')} ~
        {dateFormatter(row.original.endTime, 'YYYY-MM-DD')}
      </p>
    )
  }
]
