'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import { ProblemUsage } from '@/app/admin/problem/_components/ProblemUsage'
import { Badge } from '@/components/shadcn/badge'
import { Input } from '@/components/shadcn/input'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import type { AssignmentProblem } from '../../_libs/type'

export const createAssignmentColumns = (
  setProblems: React.Dispatch<React.SetStateAction<AssignmentProblem[]>>,
  disableInput: boolean,
  isExercise: boolean,
  t: (key: string) => string
): ColumnDef<AssignmentProblem>[] => {
  const columns: ColumnDef<AssignmentProblem>[] = [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('title_header')} />
      ),
      cell: ({ row }) => (
        <p className="w-[469px] overflow-hidden text-ellipsis whitespace-nowrap text-left">
          {row.getValue('title')}
        </p>
      ),
      footer: () => <p className="w-[469px]">{t('score_sum')}</p>,
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'order',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('order_header')} />
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
                toast.error(t('problem_order_edit_error'))
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
                setProblems((prevProblems: AssignmentProblem[]) =>
                  prevProblems.map((problem) =>
                    problem.id === row.original.id
                      ? { ...problem, order: selectedOrder.charCodeAt(0) - 65 }
                      : problem
                  )
                )
              }}
              className="disabled:pointer-events-none"
              disabled={disableInput}
            />
          </div>
        )
      }
    },
    {
      accessorKey: 'difficulty',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('level_header')} />
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
        <DataTableColumnHeader column={column} title={t('included_header')} />
      ),
      cell: ({ row }) => (
        <div className="flex w-[75px] justify-center">
          <ProblemUsage problemId={row.original.id} showAssignment={true} />
        </div>
      ),
      enableSorting: false
    }
  ]

  if (!isExercise) {
    const scoreColumn: ColumnDef<AssignmentProblem> = {
      accessorKey: 'score',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t('score_header')} />
      ),
      cell: ({ row }) => (
        <div
          className="w-15 flex justify-center"
          onClick={() => {
            if (disableInput) {
              toast.error(t('problem_scoring_edit_error'))
            }
          }}
        >
          <Input
            disabled={disableInput}
            defaultValue={row.getValue('score')}
            className="hide-spin-button text-center focus-visible:ring-0 disabled:pointer-events-none"
            type="number"
            min={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const target = e.target as HTMLInputElement
                target.blur()
              }
            }}
            onBlur={(event) => {
              setProblems((prevProblems: AssignmentProblem[]) =>
                prevProblems.map((problem) =>
                  problem.id === row.original.id
                    ? { ...problem, score: Number(event.target.value) }
                    : problem
                )
              )
            }}
          />
        </div>
      ),
      footer: ({ table }) => (
        <div className="w-15 flex justify-center">
          <Input
            disabled={true}
            className="text-center focus-visible:ring-0"
            value={table
              .getCoreRowModel()
              .rows.map((row) => row.original)
              .reduce((total, problem) => total + problem.score, 0)}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    }

    columns.splice(1, 0, scoreColumn) // Insert the score column right after the title column
  }

  return columns
}
