'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { CreateNoticeModal } from '@/app/admin/course/[courseId]/notice/_components/CreateNoticeModal'
import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { FaPen } from 'react-icons/fa6'

export interface DataTableNotice {
  id: number
  title: string
  updateTime: string
  isFixed: boolean
  isPublic: boolean
  createdBy?: string
  content?: string
}

function PinCell({ row }: { row: Row<DataTableNotice> }) {
  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(
      new CustomEvent('noticeUpdated', {
        detail: { type: 'pin', id: row.original.id }
      })
    )
  }

  return (
    <div className="flex items-center justify-center">
      <Checkbox checked={row.original.isFixed} onClick={handleTogglePin} />
    </div>
  )
}

function EditCell({
  row,
  courseId
}: {
  row: Row<DataTableNotice>
  courseId: string
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="flex items-center justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setIsModalOpen(true)
          }}
          className="h-10 rounded-full border border-[#C4C4C4] bg-[#F5F5F5] px-4 hover:bg-[#F5F5F5]/80"
        >
          <FaPen className="h-4 w-4 text-[#C4C4C4]" />
        </Button>
      </div>
      <CreateNoticeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        courseId={courseId}
        editData={
          isModalOpen
            ? {
                id: row.original.id,
                title: row.original.title,
                content: row.original.content || ''
              }
            : null
        }
      />
    </>
  )
}

function DeleteCell({ row }: { row: Row<DataTableNotice> }) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.dispatchEvent(
      new CustomEvent('noticeUpdated', {
        detail: { type: 'delete', id: row.original.id }
      })
    )
  }

  return (
    <div className="flex items-center justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className="h-10 rounded-full border border-[#C4C4C4] bg-[#F5F5F5] px-4 hover:bg-[#F5F5F5]/80"
      >
        <FaTrash className="h-4 w-4 text-[#C4C4C4]" />
      </Button>
    </div>
  )
}

export const getColumns = (courseId: string): ColumnDef<DataTableNotice>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No" className="w-[64px]" />
    ),
    enableSorting: false,
    cell: ({ row, table }) => {
      const allRows = table.getRowModel().rows
      const sorted = [...allRows].sort(
        (a, b) =>
          new Date(a.original.updateTime).getTime() -
          new Date(b.original.updateTime).getTime()
      )
      const order = sorted.findIndex((r) => r.id === row.id) + 1
      return String(order).padStart(3, '0')
    }
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Title"
        className="w-[600px]"
      />
    ),
    cell: ({ row }) => {
      return <span>{row.getValue('title')}</span>
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    id: 'edit',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Edit"
        className="w-[80px]"
      />
    ),
    cell: ({ row }) => <EditCell row={row} courseId={courseId} />,
    enableSorting: false
  },
  {
    id: 'delete',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Delete"
        className="w-[80px]"
      />
    ),
    cell: ({ row }) => <DeleteCell row={row} />,
    enableSorting: false
  },
  {
    id: 'pin',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pin" className="w-[80px]" />
    ),
    cell: ({ row }) => <PinCell row={row} />,
    enableSorting: false
  }
]

export const columns: ColumnDef<DataTableNotice>[] = []
