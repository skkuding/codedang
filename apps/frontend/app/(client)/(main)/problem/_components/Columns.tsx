'use client'

import { Badge } from '@/components/shadcn/badge'
import type { Problem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { SortButton } from './SortButton'

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
    header: () => <SortButton order="level">난이도</SortButton>,
    accessorKey: 'difficulty',
    cell: ({ row }) => (
      <Badge variant={row.original.difficulty}>
        Level {row.original.difficulty.slice(-1)}
      </Badge>
    )
  },
  {
    header: () => <SortButton order="submit">제출</SortButton>,
    accessorKey: 'submissionCount',
    cell: ({ row }) => row.original.submissionCount
  },
  {
    header: () => <SortButton order="acrate">성공 비율</SortButton>,
    accessorKey: 'acceptedRate',
    cell: ({ row }) => {
      const acceptedRate = row.original.acceptedRate * 100
      let textStyle = 'text-[#1F1F1F]'

      if (acceptedRate === 100) {
        textStyle = 'text-primary'
      } else if (acceptedRate === 0) {
        textStyle = 'text-color-neutral-80'
      }

      return <span className={textStyle}>{`${acceptedRate.toFixed(2)}%`}</span>
    }
  }
]
