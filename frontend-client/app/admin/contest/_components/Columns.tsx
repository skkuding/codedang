'use client'

import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import type { ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { useState } from 'react'
import { FiEyeOff } from 'react-icons/fi'
import { FiEye } from 'react-icons/fi'

export interface Contest {
  id: number
  title: string
  startTime: string
  endTime: string
  participants: number
}

// No api for hidden (임시 hiddenCell 만듦)
function HiddenCell() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex space-x-2">
      <Switch id="hidden-mode" checked={visible} onCheckedChange={setVisible} />
      <div className="flex items-center justify-center">
        {visible ? (
          <FiEye className="text-primary h-[14px] w-[14px]" />
        ) : (
          <FiEyeOff className="h-[14px] w-[14px] text-gray-400" />
        )}
      </div>
    </div>
  )
}

export const columns: ColumnDef<Contest>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px] bg-white"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px] bg-white"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => row.getValue('title'),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'period',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader
          column={column}
          title="Period"
          className="text-center"
        />
      </div>
    ),
    cell: ({ row }) => (
      <p className="text-center">
        {dayjs(row.original.startTime).format('YYYY-MM-DD HH:mm')} ~{' '}
        {dayjs(row.original.endTime).format('YYYY-MM-DD HH:mm')}
      </p>
    )
  },
  {
    accessorKey: 'register',
    header: ({ column }) => (
      <div className="flex justify-center">
        <DataTableColumnHeader column={column} title="Register" />
      </div>
    ),
    cell: ({ row }) => (
      <p className="text-center">{row.original.participants}</p>
    )
  },
  {
    accessorKey: 'hidden',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visible" />
    ),
    cell: HiddenCell
  }
]
