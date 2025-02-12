'use client'

import { cn } from '@/libs/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { ProblemDataTop } from '../page'

export const RenderProblemColumn: ColumnDef<ProblemDataTop['data'][number]>[] =
  [
    {
      header: 'No',
      accessorKey: 'order',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start gap-3 md:gap-4">
            <span className={cn('text-sm md:text-base')}>
              {String.fromCharCode(row.original.order + 65)}
            </span>
          </div>
        )
      }
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => row.original.title
    }
  ]
