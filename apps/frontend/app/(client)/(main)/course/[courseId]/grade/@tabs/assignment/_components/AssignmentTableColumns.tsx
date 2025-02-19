import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import type { ColumnDef } from '@tanstack/react-table'

export interface Assignment {
  id: number
  week: number
  title: string
  due: string
  problems: Problem[]
}

export interface Problem {
  id: number
  title: string
  mean: number
  max: number
  min: number
  score: number
  isSubmitted: boolean
}

export const columns: ColumnDef<Assignment>[] = [
  {
    accessorKey: 'title',
    accessorFn: (row): { week: number; title: string } => ({
      week: row.week,
      title: row.title
    }),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const { week, title } = row.getValue<{ week: number; title: string }>(
        'title'
      )
      return (
        <div className="w-[400px] flex-col overflow-hidden text-ellipsis whitespace-nowrap text-left font-medium">
          <span className="text-primary mr-2">Week{week}</span>
          <span className="font-semibold">{title}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'due',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Due" />
    ),
    cell: ({ row }) => {
      return <div>{row.getValue('due')}</div>
    }
  },
  {
    accessorKey: 'mean',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mean" />
    ),
    cell: ({ row }) => {
      return <div>{row.getValue('mean')}</div>
    }
  },
  {
    accessorKey: 'max',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Max" />
    ),
    cell: ({ row }) => {
      return <div>{row.getValue('max')}</div>
    }
  },
  {
    accessorKey: 'min',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Min" />
    ),
    cell: ({ row }) => {
      return <div>{row.getValue('min')}</div>
    }
  }
]
