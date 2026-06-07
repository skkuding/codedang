'use client'

import { Badge } from '@/components/shadcn/badge'
import { cn } from '@/libs/utils'
import type { Problem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<Problem>[] = [
  {
    header: '질문',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-body1_m_16 overflow-hidden text-ellipsis whitespace-nowrap text-left">{`${row.original.id}. ${row.original.title}`}</p>
      )
    }
  },
  {
    header: '난이도',
    accessorKey: 'difficulty',
    cell: ({ row }) => (
      <Badge variant={row.original.difficulty}>
        Level {row.original.difficulty.slice(-1)}
      </Badge>
    )
  },
  {
    header: '제출',
    accessorKey: 'submissionCount',
    cell: ({ row }) => {
      return (
        <span className="text-body3_r_16 text-color-cool-neutral-30">
          {row.original.submissionCount}
        </span>
      )
    }
  },
  {
    header: '성공 비율',
    accessorKey: 'acceptedRate',
    cell: ({ row }) => {
      const acceptedRate = row.original.acceptedRate * 100
      let textColor = 'text-color-cool-neutral-30'

      if (acceptedRate === 100) {
        textColor = 'text-primary'
      } else if (acceptedRate === 0) {
        textColor = 'text-color-neutral-80'
      }

      return (
        <span
          className={cn('text-body3_r_16', textColor)}
        >{`${acceptedRate.toFixed(2)}%`}</span>
      )
    }
  }
]
