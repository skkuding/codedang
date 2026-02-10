'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import type { ColumnDef } from '@tanstack/react-table'

export interface PlagiarismResult {
  id: number
  firstCheckSubmissionId: number
  secondCheckSubmissionId: number
  averageSimilarity: number
  maxSimilarity: number
  maxLength: number
  longestMatch: number
  firstSimilarity: number
  secondSimilarity: number
  clusterId: number | null
  cluster: {
    averageSimilarity: number
    strength: number
  } | null
}

export function createPlagiarismResultColumns(
  onCompareClick: (row: PlagiarismResult) => void,
  onClusterClick: (clusterId: number) => void
): ColumnDef<PlagiarismResult>[] {
  return [
    {
      accessorKey: 'firstCheckSubmissionId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="1st submission ID" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          #{row.original.firstCheckSubmissionId}
        </div>
      )
    },
    {
      accessorKey: 'secondCheckSubmissionId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="2nd submission ID" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">
          #{row.original.secondCheckSubmissionId}
        </div>
      )
    },
    {
      accessorKey: 'averageSimilarity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Average similarity" />
      ),
      cell: ({ row }) => {
        const similarity = row.original.averageSimilarity
        const similarityPercent = (similarity * 100).toFixed(2)
        let colorClass = 'text-gray-600'
        if (similarity > 0.8) {
          colorClass = 'text-red-600 font-bold'
        } else if (similarity > 0.6) {
          colorClass = 'text-orange-600 font-semibold'
        } else if (similarity > 0.4) {
          colorClass = 'text-yellow-600'
        }
        return (
          <div className={`${colorClass} text-sm`}>{similarityPercent}%</div>
        )
      }
    },
    {
      accessorKey: 'maxSimilarity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Max similarity" />
      ),
      cell: ({ row }) => {
        const similarity = row.original.maxSimilarity
        return <div className="text-sm">{(similarity * 100).toFixed(2)}%</div>
      }
    },
    {
      accessorKey: 'clusterId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cluster" />
      ),
      cell: ({ row }) => {
        const clusterId = row.original.clusterId
        if (clusterId === null) {
          return <div className="text-sm text-gray-400">-</div>
        }
        return (
          <button
            type="button"
            onClick={() => onClusterClick(clusterId)}
            className="text-primary text-sm font-medium hover:underline"
          >
            #{clusterId}
          </button>
        )
      }
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onCompareClick(row.original)}
          className="text-primary text-sm font-medium hover:underline"
        >
          Compare
        </button>
      )
    }
  ]
}
