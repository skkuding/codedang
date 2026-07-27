'use client'

import { DataTableColumnHeader } from '@/app/admin/_components/table/DataTableColumnHeader'
import type { ProblemData } from '@/app/admin/contest/_libs/schemas'
import { UPDATE_ASSIGNMENT_PROBLEM_RECORD } from '@/graphql/assignment/mutations'
import { cn } from '@/libs/utils'
import { useMutation } from '@apollo/client'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { SquareArrowOutUpRight } from 'lucide-react'
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
    ...problemData.map((problem, i) => ({
      accessorKey: `${String.fromCharCode(Number(65 + i))}`,
      header: () => {
        return String.fromCharCode(Number(65 + i))
      },
      cell: ({ row }: { row: Row<DataTableScoreSummary> }) => {
        const problemScore = row.original.scoreSummaryByProblem.find(
          (ps) => ps.problemId === problem.problemId
        )
        if (currentView === 'auto') {
          return (
            <div className="text-xs">
              {problemScore?.score ?? '-'} / {problemScore?.maxScore ?? 0}
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
    })),
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
