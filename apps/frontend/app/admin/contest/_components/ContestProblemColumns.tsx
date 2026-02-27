'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { ProblemUsage } from '@/app/admin/problem/_components/ProblemUsage'
import { Badge } from '@/components/shadcn/badge'
// import { Input } from '@/components/shadcn/input'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../../_components/table/DataTableColumnHeader'
import type { ContestProblem } from '../_libs/schemas'

export const createColumns = (
  setProblems: React.Dispatch<React.SetStateAction<ContestProblem[]>>,
  disableInput: boolean,
  t: (key: string) => string
): ColumnDef<ContestProblem>[] => {
  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('title_header_column_title')}
        />
      ),
      cell: ({ row }) => {
        return row.getValue('title')
      },
      footer: () => (
        <p className="w-[350px] text-left text-sm">{t('score_sum_text')}</p>
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'order',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('order_header_column_title')}
        />
      ),
      cell: ({ table, row }) => {
        const tableRows = table.getRowModel().rows
        const alphabetArray = tableRows.map((_, index) =>
          String.fromCharCode(65 + index)
        )
        return (
          <div
            className="flex justify-center"
            onClick={() => {
              if (disableInput) {
                toast.error(t('problem_order_error'))
              }
            }}
          >
            <OptionSelect
              value={
                row.original.order !== undefined
                  ? String.fromCharCode(Number(65 + row.original.order))
                  : String.fromCharCode(Number(65 + row.index))
              }
              options={alphabetArray}
              onChange={(selectedOrder) => {
                setProblems((prevProblems: ContestProblem[]) =>
                  prevProblems.map((problem) =>
                    problem.id === row.original.id
                      ? { ...problem, order: selectedOrder.charCodeAt(0) - 65 }
                      : problem
                  )
                )
              }}
              className="w-[70px] disabled:pointer-events-none"
              disabled={disableInput}
            />
          </div>
        )
      }
    },
    {
      accessorKey: 'difficulty',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('level_header_column_title')}
        />
      ),
      cell: ({ row }) => {
        const level: string = row.getValue('difficulty')
        return (
          <div>
            <Badge variant={level as Level}>Level {level.slice(-1)}</Badge>
          </div>
        )
      },
      enableSorting: false
    },
    {
      accessorKey: 'included',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={t('included_header_column_title')}
        />
      ),
      cell: ({ row }) => (
        <ProblemUsage problemId={row.original.id} showContest={true} />
      ),
      enableSorting: false
    }
  ]
}
