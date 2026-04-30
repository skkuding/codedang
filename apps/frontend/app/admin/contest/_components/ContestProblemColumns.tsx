'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { ProblemUsage } from '@/app/admin/problem/_components/ProblemUsage'
import { Badge } from '@/components/shadcn/badge'
import { Input } from '@/components/shadcn/input'
import type { Level } from '@/types/type'
import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { toast } from 'sonner'
import { DataTableColumnHeader } from '../../_components/table/DataTableColumnHeader'
import type { ContestProblem } from '../_libs/schemas'

const DEFAULT_SCORE = 1

function ScoreInput({
  value,
  disabled,
  onChange
}: {
  value: number
  disabled: boolean
  onChange: (score: number) => void
}) {
  const [localValue, setLocalValue] = useState(String(value))

  return (
    <Input
      type="number"
      min={0}
      step={1}
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value)
        const parsed = parseInt(e.target.value)
        if (!isNaN(parsed) && parsed >= 0) {
          onChange(parsed)
        }
      }}
      onBlur={() => {
        const parsed = parseInt(localValue)
        if (isNaN(parsed) || parsed < 0) {
          setLocalValue(String(value))
        }
      }}
      disabled={disabled}
      className="w-[80px]"
      onClick={(e) => e.stopPropagation()}
    />
  )
}

export const createColumns = (
  setProblems: React.Dispatch<React.SetStateAction<ContestProblem[]>>,
  disableInput: boolean
): ColumnDef<ContestProblem>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return row.getValue('title')
    },
    footer: () => <p className="w-[350px] text-left text-sm">Score Sum</p>,
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'score',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Score" />
    ),
    cell: ({ row }) => (
      <ScoreInput
        value={row.original.score ?? DEFAULT_SCORE}
        disabled={disableInput}
        onChange={(score) =>
          setProblems((prev) =>
            prev.map((p) => (p.id === row.original.id ? { ...p, score } : p))
          )
        }
      />
    ),
    footer: ({ table }) => {
      const total = table
        .getRowModel()
        .rows.reduce(
          (sum, row) => sum + (row.original.score ?? DEFAULT_SCORE),
          0
        )
      return <p className="text-sm">{total}</p>
    },
    enableSorting: false
  },
  {
    accessorKey: 'order',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order" />
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
      <DataTableColumnHeader column={column} title="Level" />
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
      <DataTableColumnHeader column={column} title="Included" />
    ),
    cell: ({ row }) => (
      <ProblemUsage problemId={row.original.id} showContest={true} />
    ),
    enableSorting: false
  }
]
