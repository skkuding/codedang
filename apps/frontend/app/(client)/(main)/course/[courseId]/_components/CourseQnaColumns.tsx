import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { dateFormatter } from '@/libs/utils'
import lockGrayIcon from '@/public/icons/lock-gray.svg'
import type { CourseQnAItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

export const courseQnAColumns: ColumnDef<
  CourseQnAItem & { assignmentTitle?: string; problemTitle?: string }
>[] = [
  {
    accessorKey: 'assignmentTitle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Task" />
    ),
    cell: ({ row }) => (
      <div
        className="text-color-neutral-30 max-w-[150px] truncate"
        title={row.original.assignmentTitle}
      >
        {row.original.assignmentTitle}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'problemTitle',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Problem" />
    ),
    cell: ({ row }) => (
      <div
        className="text-color-neutral-30 max-w-[200px] truncate"
        title={row.original.problemTitle}
      >
        {row.original.problemTitle}
      </div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
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
          <span className="max-w-[400px] truncate" title={title}>
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
      <DataTableColumnHeader column={column} title="Writer" />
    ),
    cell: ({ row }) => row.original.createdBy?.username,
    enableSorting: false
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => dateFormatter(row.original.createTime, 'YY-MM-DD HH:mm'),
    enableSorting: false
  }
]
