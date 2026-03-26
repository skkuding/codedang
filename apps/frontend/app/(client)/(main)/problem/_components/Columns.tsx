'use client'

import { Badge } from '@/components/shadcn/badge'
import type { Problem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { SortButton } from './SortButton'

export const columns: ColumnDef<Problem>[] = [
  {
    header: 'Question',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm md:text-base">{`${row.original.id}. ${row.original.title}`}</p>
      )
    }
  },
  {
    header: () => <SortButton order="level">Level</SortButton>,
    accessorKey: 'difficulty',
    cell: ({ row }) => (
      <Badge variant={row.original.difficulty}>
        Level {row.original.difficulty.slice(-1)}
      </Badge>
    )
  },
  {
    header: () => <SortButton order="submit">Submission</SortButton>,
    accessorKey: 'submissionCount',
    cell: ({ row }) => row.original.submissionCount
  },
  {
    header: () => <SortButton order="acrate">Success Rate</SortButton>,
    accessorKey: 'acceptedRate',
    cell: ({ row }) => {
      const acceptedRate = row.original.acceptedRate * 100
      let textStyle = 'text-[#1F1F1F]'

      if (acceptedRate === 100) {
        textStyle = 'text-primary'
      } else if (acceptedRate === 0) {
        textStyle = 'text-color-neutral-50'
      }

      return <span className={textStyle}>{`${acceptedRate.toFixed(2)}%`}</span>
    }
  }
]
