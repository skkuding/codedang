'use client'

import type { ProblemDataTop } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const RenderProblemColumn: ColumnDef<ProblemDataTop['data'][number]>[] =
  [
    {
      header: 'No',
      accessorKey: 'order',
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center p-0">
            <span className="text-body4_r_14 p-0 text-center text-black md:text-base">
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
            <span className="text-body4_r_14 text-black md:text-base">
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
      cell: () => {
        return (
          <div className="flex items-center justify-center p-0">
            <span className="text-body4_r_14 text-black md:text-base">
              {''}
            </span>
          </div>
        )
      }
    }
  ]
