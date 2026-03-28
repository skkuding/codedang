'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import type { ProblemData } from '@/app/admin/contest/_libs/schemas'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/shadcn/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { UPDATE_ASSIGNMENT_PROBLEM_RECORD } from '@/graphql/assignment/mutations'
import { cn } from '@/libs/utils'
import { useMutation } from '@apollo/client'
import type { Column, ColumnDef, Row } from '@tanstack/react-table'
import { Check, SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

interface DataTableScoreSummary {
  id: number
  studentId: string
  realName?: string | null
  username: string
  submittedProblemCount: number
  totalProblemCount: number
  userAssignmentScore: number
  assignmentPerfectScore: number
  userAssignmentFinalScore?: number | null | undefined
  scoreSummaryByProblem: {
    problemId: number
    score: number
    maxScore: number
    finalScore?: number | null
    acceptedTestcaseCount: number
    totalTestcaseCount: number
  }[]
}

function ScoreEditableCell({
  problemScore,
  groupId,
  assignmentId,
  userId,
  refetch,
  isAssignmentFinished
}: {
  problemScore:
    | {
        score: number
        maxScore: number
        problemId: number
        finalScore?: number | null
      }
    | undefined
  groupId: number
  assignmentId: number
  userId: number
  refetch: () => void
  isAssignmentFinished: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(
    problemScore && typeof problemScore.finalScore === 'number'
      ? String(problemScore.finalScore)
      : ''
  )
  const [updateScore, { loading }] = useMutation(
    UPDATE_ASSIGNMENT_PROBLEM_RECORD,
    {
      onCompleted: () => {
        toast.success('Score saved successfully.')
        setEditing(false)
        if (refetch) {
          refetch()
        }
      },
      onError: (error) => {
        console.error('Score save error:', error)
        toast.error('Failed to save score.')
        setInputValue(
          problemScore &&
            typeof (problemScore.finalScore ?? problemScore.score) === 'number'
            ? String(problemScore.finalScore ?? problemScore.score)
            : ''
        )
        setEditing(false)
      }
    }
  )
  const handleSave = async () => {
    if (!problemScore) {
      return
    }
    const num = Number(inputValue)
    if (inputValue === '' || num < 0 || num > problemScore.maxScore) {
      toast.error(
        `Only integers between 0 and ${problemScore.maxScore} are allowed.`
      )
      setInputValue(
        typeof (problemScore.finalScore ?? problemScore.score) === 'number'
          ? String(problemScore.finalScore ?? problemScore.score)
          : ''
      )
      setEditing(false)
      return
    }
    await updateScore({
      variables: {
        groupId,
        input: {
          assignmentId,
          problemId: problemScore.problemId,
          userId,
          comment: '',
          finalScore: num
        }
      }
    })
  }
  if (editing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <input
          type="number"
          min={0}
          max={problemScore?.maxScore ?? 0}
          className="hide-spin-button rounded-xs w-8 border px-1 py-0.5 text-center text-xs"
          value={inputValue}
          autoFocus
          disabled={loading}
          onChange={(e) => {
            const v = e.target.value
            if (/^\d*$/.test(v) && Number(v) <= (problemScore?.maxScore ?? 0)) {
              setInputValue(v)
            }
          }}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            }
            if (e.key === 'Escape') {
              setInputValue(
                typeof (problemScore?.finalScore ?? problemScore?.score) ===
                  'number'
                  ? String(problemScore?.finalScore ?? problemScore?.score)
                  : ''
              )
              setEditing(false)
            }
          }}
        />
        <span className="text-xs"> / {problemScore?.maxScore ?? 0}</span>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'rounded-xs cursor-pointer text-xs hover:bg-gray-100',
        editing && 'bg-gray-100'
      )}
      onClick={() => {
        if (!isAssignmentFinished) {
          toast.error('Only completed assignments can be graded')
          return
        }
        setEditing(true)
      }}
    >
      {problemScore?.finalScore ?? '-'} / {problemScore?.maxScore ?? 0}
    </div>
  )
}

interface ColumnHeaderSelectorProps {
  label: string
  isTestcaseMode: boolean
  onToggle: (isTestcaseMode: boolean) => void
}

function ColumnHeaderSelector({
  label,
  isTestcaseMode,
  onToggle
}: ColumnHeaderSelectorProps) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-full">{label}</button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="testcases"
                onSelect={() => {
                  onToggle(true)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    isTestcaseMode ? 'opacity-100' : 'opacity-0'
                  )}
                />
                Testcases
              </CommandItem>
              <CommandItem
                key="score"
                onSelect={() => {
                  onToggle(false)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    !isTestcaseMode ? 'opacity-100' : 'opacity-0'
                  )}
                />
                Score
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function createProblemColumn(
  problem: ProblemData,
  index: number,
  courseId: number,
  assignmentId: number,
  isAssignmentFinished: boolean,
  currentView: 'final' | 'auto',
  refetch: () => void
): ColumnDef<DataTableScoreSummary> {
  const label = String.fromCharCode(Number(65 + index))
  return {
    accessorKey: label,
    meta: { isTestcaseMode: false } as { isTestcaseMode: boolean },
    header: ({
      column
    }: {
      column: Column<DataTableScoreSummary, unknown>
    }) => {
      if (currentView !== 'auto') {
        return <div className="w-full">{label}</div>
      }
      const meta = column.columnDef.meta as { isTestcaseMode: boolean }
      const isTestcaseMode = Boolean(meta?.isTestcaseMode)
      const handleToggle = (newValue: boolean) => {
        meta.isTestcaseMode = newValue
        column.toggleVisibility(false)
        column.toggleVisibility(true)
      }
      return (
        <ColumnHeaderSelector
          label={label}
          isTestcaseMode={isTestcaseMode}
          onToggle={handleToggle}
        />
      )
    },
    cell: ({
      row,
      column
    }: {
      row: Row<DataTableScoreSummary>
      column: Column<DataTableScoreSummary, unknown>
    }) => {
      const problemScore = row.original.scoreSummaryByProblem.find(
        (ps) => ps.problemId === problem.problemId
      )
      const isTestcaseMode = Boolean(
        (column.columnDef.meta as { isTestcaseMode?: boolean })?.isTestcaseMode
      )
      if (currentView === 'auto') {
        if (isTestcaseMode) {
          return (
            <div className="text-xs">
              {problemScore?.acceptedTestcaseCount} /{' '}
              {problemScore?.totalTestcaseCount ?? 0}
            </div>
          )
        }
        return (
          <div className="text-xs">
            {problemScore?.score} / {problemScore?.maxScore ?? 0}
          </div>
        )
      }
      return (
        <ScoreEditableCell
          problemScore={problemScore}
          groupId={courseId}
          assignmentId={assignmentId}
          userId={row.original.id}
          refetch={refetch}
          isAssignmentFinished={isAssignmentFinished}
        />
      )
    }
  }
}

export const createColumns = (
  problemData: ProblemData[],
  courseId: number,
  assignmentId: number,
  isAssignmentFinished: boolean,
  currentView: 'final' | 'auto',
  refetch: () => void
): ColumnDef<DataTableScoreSummary>[] => {
  return [
    {
      accessorKey: 'studentId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student ID" />
      ),
      cell: ({ row }) => row.getValue('studentId')
    },
    {
      accessorKey: 'realName',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => row.getValue('realName'),
      filterFn: 'includesString'
    },
    ...problemData.map((problem, index) =>
      createProblemColumn(
        problem,
        index,
        courseId,
        assignmentId,
        isAssignmentFinished,
        currentView,
        refetch
      )
    ),
    {
      accessorKey: 'userAssignmentFinalScore',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => {
        const score =
          currentView === 'auto'
            ? row.original.userAssignmentScore
            : row.original.userAssignmentFinalScore

        return `${score}/${row.original.assignmentPerfectScore}`
      }
    },
    {
      id: 'detail',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Detail" />
      ),
      cell: ({ row }) => {
        if (!problemData || problemData.length === 0) {
          return null
        }
        if (isAssignmentFinished) {
          return (
            <Link
              href={
                `/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${row.original.id}/problem/${problemData[0].problemId}` as const
              }
              target="_blank"
              className="flex justify-center"
            >
              <SquareArrowOutUpRight className="hover:text-primary text-black-500 h-4 w-4" />
            </Link>
          )
        } else {
          return <SquareArrowOutUpRight className="h-4 w-4 text-gray-300" />
        }
      }
    }
  ]
}
