'use client'

import { DataTableColumnHeader } from '@/components/DataTableColumnHeader'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Problem } from '@/types/type'
import { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { FiEyeOff } from 'react-icons/fi'
import { FiEye } from 'react-icons/fi'

// No api for hidden (임시 hiddenCell 만듦)
function HiddenCell() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex space-x-2">
      <Switch
        id="airplane-mode"
        checked={visible}
        onCheckedChange={setVisible}
      />
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

export const columns: ColumnDef<Problem>[] = [
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
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
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
    cell: ({ row }) => (
      <div className="flex-col">
        <div>{row.getValue('title')}</div>
        <div className="flex">
          <div className="">
            {row.original.tags?.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="mr-1 whitespace-nowrap rounded-md border-gray-400 bg-gray-300 px-1 font-normal"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => <div>{row.getValue('date')}</div>
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" />
    ),
    cell: ({ row }) => {
      const level: string = row.getValue('difficulty')
      const formattedLevel = `Lev.${level.slice(-1)}`
      return <div>{formattedLevel}</div>
    }
  },
  {
    accessorKey: 'submissionCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Submission" />
    ),
    cell: ({ row }) => <div>{row.getValue('submissionCount')}</div>
  },
  {
    accessorKey: 'acceptedRate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Solved" />
    ),
    cell: ({ row }) => {
      const acceptedRate: number = row.getValue('acceptedRate')
      const acceptedRateFloat = acceptedRate.toFixed(2)
      return <div>{acceptedRateFloat}%</div>
    }
  },
  {
    accessorKey: 'hidden',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hidden" />
    ),
    cell: HiddenCell
  }
]
