'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { ProblemDataTop } from '../page'

export const RenderProblemColumn: ColumnDef<ProblemDataTop['data'][number]>[] =
  [
    {
      header: 'No',
      accessorKey: 'order',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center p-0">
            <span className="p-0 text-center text-sm font-normal text-black md:text-base">
              {String.fromCharCode(row.original.order + 65)}
            </span>
          </div>
        )
      }
    },
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start p-0">
            <span className="text-sm font-normal text-black md:text-base">
              {row.original.title}
            </span>
          </div>
        )
      }
    },
    {
      //NOTE: Put score data because No Info(Special Judge) data for now
      header: 'Info',
      accessorKey: 'score',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center p-0">
            <span className="text-sm font-normal text-black md:text-base">
              {row.original.score}
            </span>
          </div>
        )
      }
    }
  ]
