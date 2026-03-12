'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import type { ColumnDef } from '@tanstack/react-table'

export interface ClusterSubmissionRow {
  id: number
  submissionId: number
  studentId: string | null
}

export function createClusterSubmissionColumns(
  selectedSubmissionIds: number[],
  onToggle: (submissionId: number) => void
): ColumnDef<ClusterSubmissionRow>[] {
  return [
    {
      id: 'select',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Select" />
      ),
      cell: ({ row }) => {
        const submissionId = row.original.submissionId
        const checked = selectedSubmissionIds.includes(submissionId)
        return (
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={checked}
            onChange={() => onToggle(submissionId)}
          />
        )
      },
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'studentId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student ID" />
      ),
      cell: ({ row }) => (
        <span className="font-mono">
          {row.original.studentId ?? '-'} (#{row.original.submissionId})
        </span>
      ),
      enableSorting: false
    }
  ]
}
