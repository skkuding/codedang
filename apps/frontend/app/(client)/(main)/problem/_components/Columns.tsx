'use client'

import { Badge } from '@/components/shadcn/badge'
import type { Problem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { SortButton } from './SortButton'

export const columns = (t: (key: string) => string): ColumnDef<Problem>[] => [
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-left text-sm md:text-base">{`${row.original.id}. ${row.original.title}`}</p>
      )
    }
  },
  {
    header: () => {
      return <SortButton order="level">{t('level_header')}</SortButton>
    },
    accessorKey: 'difficulty',
    cell: ({ row }) => (
      <Badge variant={row.original.difficulty}>
        Level {row.original.difficulty.slice(-1)}
      </Badge>
    )
  },
  {
    header: () => {
      return <SortButton order="submit">{t('submission_header')}</SortButton>
    },
    accessorKey: 'submissionCount',
    cell: ({ row }) => row.original.submissionCount
  },
  {
    header: () => {
      return <SortButton order="acrate">{t('success_rate_header')}</SortButton>
    },
    accessorKey: 'acceptedRate',
    cell: ({ row }) => `${(row.original.acceptedRate * 100).toFixed(2)}%`
  }
]
