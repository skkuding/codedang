'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { dateFormatter } from '@/libs/utils'
import lockGrayIcon from '@/public/icons/lock-gray.svg'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

export interface DataTableQna {
  id: number
  title: string
  order: number
  isResolved: boolean
  isPrivate: boolean
  createTime: string
  courseTitle: string
  category: string
  createdBy: {
    username: string
  }
}

export const columns: ColumnDef<DataTableQna>[] = [
  {
    accessorKey: 'courseTitle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course" className="w-30" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-body1_m_16 max-w-30 truncate text-[#808080]">
          {row.getValue('courseTitle')}
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
        className="w-[140px]"
      />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-body1_m_16 text-[#808080]">
          {row.original.category}
        </span>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Question"
        className="w-[290px]"
      />
    ),
    cell: ({ row }) => {
      const isPrivate = row.original.isPrivate
      const title = row.original.title
      const TEN_DAYS_IN_MS = 10 * 24 * 60 * 60 * 1000
      const isNew =
        new Date().getTime() - new Date(row.original.createTime).getTime() <
        TEN_DAYS_IN_MS

      return (
        <div className="flex items-center gap-2">
          {isPrivate && (
            <Image
              src={lockGrayIcon}
              alt="lock icon"
              className="h-4 w-4 shrink-0"
            />
          )}
          <span
            className="text-body1_m_16 max-w-[400px] truncate"
            title={title}
          >
            {title}
          </span>
          {isNew && (
            <div className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
          )}
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Writer"
        className="w-[100px]"
      />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-body1_m_16 text-[#808080]">
          {row.original.createdBy?.username}
        </span>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Date"
        className="w-[140px]"
      />
    ),
    cell: ({ row }) => {
      return (
        <span className="text-body1_m_16 text-[#808080]">
          {dateFormatter(row.original.createTime, 'YY-MM-DD HH:mm')}
        </span>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'isResolved',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Answer"
        className="w-[102px]"
      />
    ),
    cell: ({ row }) => {
      return (
        <div>
          {row.original.isResolved ? (
            <div className="bg-color-neutral-99 text-color-neutral-70 border-color-neutral-90 text-body2_m_14 items-center justify-center rounded-full border px-5 py-2">
              Answered
            </div>
          ) : (
            <div className="text-primary border-primary text-body2_m_14 items-center justify-center rounded-full border px-5 py-2">
              Unanswered
            </div>
          )}
        </div>
      )
    },
    enableSorting: false
  }
]
