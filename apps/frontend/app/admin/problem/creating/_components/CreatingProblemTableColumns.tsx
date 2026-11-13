import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { Badge } from '@/components/shadcn/badge'
import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import {
  CHECKLIST_TOTAL,
  type InProgressMandeuldangProblem,
  type InProgressProblemStatus
} from '../_libs/useInProgressMandeuldangProblems'

const statusStyle: Record<InProgressProblemStatus, string> = {
  Draft: 'bg-color-neutral-95 text-color-neutral-50',
  Ready: 'bg-color-blue-95 text-color-blue-50'
}

export const columns: ColumnDef<InProgressMandeuldangProblem>[] = [
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
      return row.getValue('title')
    },
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge className={cn('rounded-sm border-0', statusStyle[status])}>
          {status}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'myRole',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="My Role" />
    ),
    cell: ({ row }) => row.original.myRole ?? '-'
  },
  {
    accessorKey: 'updateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Update" />
    ),
    cell: ({ row }) => {
      return <div>{row.original.updateTime.substring(2, 10)}</div>
    }
  },
  {
    accessorKey: 'checklistProgress',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Checklist" />
    ),
    cell: ({ row }) => {
      const progress = row.original.checklistProgress
      return progress === null ? '-' : `${progress}/${CHECKLIST_TOTAL}`
    }
  },
  {
    accessorKey: 'collaboratorCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Collaborators" />
    ),
    cell: ({ row }) => row.original.collaboratorCount ?? '-'
  }
]
