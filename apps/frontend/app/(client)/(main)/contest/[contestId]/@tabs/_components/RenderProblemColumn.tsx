'use client'

import type { ProblemDataTop } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'

export const RenderProblemColumn = ({
  t
}: {
  t: (key: string) => string
}): ColumnDef<ProblemDataTop['data'][number]>[] => {
  return [
    {
      header: t('no_header'),
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
      header: t('title_header'),
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
      header: t('info_header'),
      accessorKey: 'score',
      cell: () => {
        return (
          <div className="flex items-center justify-center p-0">
            <span className="text-sm font-normal text-black md:text-base">
              {''}
            </span>
          </div>
        )
      }
    }
  ]
}
