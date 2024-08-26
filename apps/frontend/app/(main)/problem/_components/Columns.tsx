'use client'

import SortButton from '@/components/SortButton'
import { Badge } from '@/components/ui/badge'
import type { Level, Problem } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const columns: ColumnDef<Problem>[] = [
  {
    header: 'No',
    accessorKey: 'index',
    cell: ({ row }) => {
      return (
        <span className="text-ellipsis whitespace-nowrap text-sm md:text-base">
          {row.index + 1}
        </span>
      )
    }
  },
  {
    header: 'Title',
    accessorKey: 'title',
    cell: ({ row }) => {
      return (
        <p className="text-ellipsis whitespace-nowrap text-sm tracking-tighter md:text-base">{`${row.original.title}`}</p>
      )
    }
  },
  {
    header: () => <SortButton order="level">Level</SortButton>,
    accessorKey: 'difficulty',
    cell: ({ row }) => (
      <Badge className="rounded-md" variant={row.original.difficulty as Level}>
        {row.original.difficulty}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    }
  },
  {
    accessorKey: 'languages',
    header: () => {},
    cell: () => {},
    filterFn: (row, id, value) => {
      const languages = row.original.languages
      if (!languages?.length) {
        return false
      }

      const langValue: string[] = row.getValue(id)
      const valueArray = value as string[]
      const result = langValue.some((language) => valueArray.includes(language))
      return result
    }
  },
  {
    header: () => <SortButton order="submit">Submission</SortButton>,
    accessorKey: 'submissionCount',
    cell: ({ row }) => row.original.submissionCount
  },
  {
    header: () => <SortButton order="acrate">Success Rate</SortButton>,
    accessorKey: 'acceptedRate',
    cell: ({ row }) => `${(row.original.acceptedRate * 100).toFixed(2)}%`
  },
  {
    header: 'Result',
    accessorKey: 'results',
    cell: ({ row }) => row.original.results
  }
]
