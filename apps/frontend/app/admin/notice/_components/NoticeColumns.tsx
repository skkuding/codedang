import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Checkbox } from '@/components/shadcn/checkbox'
import type { ColumnDef } from '@tanstack/react-table'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { TbPinned, TbPinnedOff } from 'react-icons/tb'

export interface Notice {
  id: number
  title: string
  isVisible: boolean
  isFixed: boolean
  createTime?: Date
  updateTime: Date
}

export const columns: ColumnDef<Notice>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) =>
          table.toggleAllPageRowsSelected(Boolean(value))
        }
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(Boolean(value))}
        aria-label="Select row"
        className="translate-y-[2px] bg-transparent"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'isVisible',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visible" />
    ),
    cell: ({ row }) =>
      row.getValue('isVisible') ? (
        <FaEye className="text-gray-400" size={18} />
      ) : (
        <FaEyeSlash className="text-gray-400" size={18} />
      ),
    enableSorting: false
  },
  {
    accessorKey: 'isFixed',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fixed" />
    ),
    cell: ({ row }) =>
      row.getValue('isFixed') ? (
        <TbPinned className="text-gray-400" size={18} />
      ) : (
        <TbPinnedOff className="text-gray-400" size={18} />
      ),
    enableSorting: false
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Title"
        className="w-[300px]"
      />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex w-full justify-center">
          {row.getValue('title')}
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Create" />
    ),
    cell: ({ getValue }) => {
      const createTime = getValue<string>()

      return new Date(createTime).toLocaleDateString('ko-KR')
    }
  },
  {
    accessorKey: 'updateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Update" />
    ),
    cell: ({ getValue }) => {
      const updateTime = getValue<string>()

      return new Date(updateTime).toLocaleString('ko-KR')
    }
  }
]
