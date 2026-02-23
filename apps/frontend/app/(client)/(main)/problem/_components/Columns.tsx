'use client'

import { LevelBadge } from '@/components/LevelBadge'
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
    cell: ({ row }) => <LevelBadge level={row.original.difficulty} />
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
