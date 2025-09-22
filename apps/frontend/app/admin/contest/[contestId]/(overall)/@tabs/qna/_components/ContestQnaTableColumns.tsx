import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { dateFormatter } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'

export interface DataTableQna {
  id: number
  order: number
  title: string
  createTime: string
  category: string
  isResolved: boolean
  contestId: number
  problemId?: number | null
  createdBy?: { username: string } | null
  _count: { comments: number }
}

interface CreatedByType {
  username: string
}

export const createColumns = (): ColumnDef<DataTableQna>[] => [
  {
    accessorKey: 'order',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="No" />
    ),
    cell: ({ row }) => {
      return row.getValue('order')
    }
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Category"
        className="w-[200px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('category')
    }
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Question"
        className="w-[400px]"
      />
    ),
    cell: ({ row }) => {
      return row.getValue('title')
    },
    enableSorting: false,
    enableHiding: false
  },
  /**
   * @description
   * made this column for filtering languages
   * doesn't show in datatable
   */
  {
    accessorKey: 'createdBy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Writer" />
    ),
    cell: ({ row }) => {
      const createdBy: CreatedByType = row.getValue('createdBy')
      return createdBy.username
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'createTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return dateFormatter(row.getValue('createTime'), 'YYYY-MM-DD HH:mm:ss')
    }
  },
  {
    accessorKey: 'Answer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Answer" />
    ),
    cell: ({ row }) => {
      return <p>answer</p>
    }
  }
]
