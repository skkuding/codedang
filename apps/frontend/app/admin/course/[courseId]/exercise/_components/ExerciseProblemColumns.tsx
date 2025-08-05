'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { ProblemUsage } from '@/app/admin/problem/_components/ProblemUsage'
import { Badge } from '@/components/shadcn/badge'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import type { AssignmentProblem } from '../../_libs/type'

export const createExerciseColumns = (
  setProblems: React.Dispatch<React.SetStateAction<AssignmentProblem[]>>,
  disableInput: boolean
): ColumnDef<AssignmentProblem>[] => [
  {
    accessorKey: 'title',
    header: () => <p className="w-[350px] text-left text-sm">Title</p>,
    cell: ({ row }) => (
      <p className="w-[350px] overflow-hidden text-ellipsis whitespace-nowrap text-left">
        {row.getValue('title')}
      </p>
    ),
    footer: () => <p className="w-[350px] text-left text-sm">Score Sum</p>,
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'order',
    header: () => <p className="text-center text-sm">Order</p>,
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
              toast.error('Problem order cannot be edited')
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
            className="w-[70px] disabled:pointer-events-none"
            disabled={disableInput}
          />
        </div>
      )
    }
  },
  {
    accessorKey: 'difficulty',
    header: () => <p className="text-center text-sm">Level</p>,
    cell: ({ row }) => {
      const level: string = row.getValue('difficulty')
      const formattedLevel = `Level ${level.slice(-1)}`
      return (
        <div>
          <Badge
            variant={level as Level}
            className="whitespace-nowrap rounded-md px-1.5 py-1 font-normal"
          >
            {formattedLevel}
          </Badge>
        </div>
      )
    },
    enableSorting: false
  },
  {
    accessorKey: 'included',
    header: () => <p className="text-center text-sm">Included</p>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <ProblemUsage problemId={row.original.id} showAssignment={true} />
      </div>
    ),
    enableSorting: false
  }
]
