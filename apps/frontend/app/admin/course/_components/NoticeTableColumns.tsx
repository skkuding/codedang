'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { cn, dateFormatter } from '@/libs/utils'
import PenIcon from '@/public/icons/pen.svg'
import TrashcanGrayIcon from '@/public/icons/trashcan2-gray.svg'
import type { CourseNoticeListItem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

const headerClassName = 'text-body2_m_14 text-color-neutral-60'
const cellClassName = 'text-body2_m_14 text-black'

export interface DataTableNotice extends CourseNoticeListItem {
  no: number
}

interface NoticeColumnHandlers {
  onEdit: (notice: DataTableNotice) => void
  onDeleteRequest: (noticeId: number) => void
  onTogglePin: (notice: DataTableNotice) => void
  loadingEditId: number | null
  togglingPinId: number | null
  isDeleting: boolean
}

export function getNoticeColumns({
  onEdit,
  onDeleteRequest,
  onTogglePin,
  loadingEditId,
  togglingPinId,
  isDeleting
}: NoticeColumnHandlers): ColumnDef<DataTableNotice>[] {
  return [
    {
      accessorKey: 'no',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="No"
          className={headerClassName}
        />
      ),
      cell: ({ row }) => (
        <span className={cellClassName}>{row.original.no}</span>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Title"
          className={headerClassName}
        />
      ),
      cell: ({ row }) => (
        <span className={cn('truncate', cellClassName)}>
          {row.original.title}({row.original.commentCount})
        </span>
      ),
      enableSorting: false
    },
    {
      accessorKey: 'updateTime',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Date"
          className={headerClassName}
        />
      ),
      cell: ({ row }) => {
        const date = row.original.updateTime ?? row.original.createTime
        return (
          <span className={cellClassName}>
            {date ? dateFormatter(date, 'YYYY-MM-DD') : '-'}
          </span>
        )
      },
      enableSorting: false
    },
    {
      id: 'edit',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Edit"
          className={headerClassName}
        />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          aria-label={`Edit ${row.original.title}`}
          disabled={loadingEditId === row.original.id}
          onClick={(e) => {
            e.stopPropagation()
            onEdit(row.original)
          }}
          className="border-color-neutral-90 bg-color-neutral-99 hover:color-neutral-95 w-13 flex h-10 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PenIcon className="text-color-neutral-70 size-5" />
        </button>
      ),
      enableSorting: false
    },
    {
      id: 'delete',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Delete"
          className={headerClassName}
        />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          aria-label={`Delete ${row.original.title}`}
          disabled={isDeleting}
          onClick={(e) => {
            e.stopPropagation()
            onDeleteRequest(row.original.id)
          }}
          className="border-color-neutral-90 bg-color-neutral-99 hover:color-neutral-95 w-13 flex h-10 items-center justify-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          <TrashcanGrayIcon className="text-color-neutral-70 size-5" />
        </button>
      ),
      enableSorting: false
    },
    {
      id: 'pin',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Pin"
          className={headerClassName}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Pin ${row.original.title}`}
          checked={row.original.isFixed}
          disabled={togglingPinId === row.original.id}
          onClick={(e) => e.stopPropagation()}
          onChange={() => onTogglePin(row.original)}
          className="size-4 rounded border border-[#D4D4D8] disabled:cursor-not-allowed disabled:opacity-60"
        />
      ),
      enableSorting: false
    }
  ]
}
