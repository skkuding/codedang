'use client'

import type { ProblemData } from '@/app/admin/contest/_libs/schemas'
import { UPDATE_ASSIGNMENT_PROBLEM_RECORD } from '@/graphql/assignment/mutations'
import { cn } from '@/libs/utils'
import { useMutation } from '@apollo/client'
import type { ColumnDef } from '@tanstack/react-table'
import { SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { CommentCell } from './CommentCell'

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
  problemScores: {
    problemId: number
    score: number
    maxScore: number
  }[]
  testcaseResults?: { id: number; isHidden: boolean; result: string }[]
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
        <span className="text-xs">/{problemScore?.maxScore ?? 0}</span>
      </div>
    )
  }
  return (
    <div
      className={cn(
        'rounded-xs cursor-pointer px-1 text-xs hover:bg-gray-100',
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
      {problemScore?.finalScore ?? '-'}/{problemScore?.maxScore ?? 0}
    </div>
  )
}

function TestcaseCell({
  results
}: {
  results: { id: number; isHidden: boolean; result: string }[]
}) {
  return (
    <div className="whitespace-nowrap">
      {results.length === 0 ? (
        <span className="text-xs text-gray-400">No testcases</span>
      ) : (
        results.map((r, i) => {
          const isPass = r.result === 'Accepted'
          return (
            <span
              key={r.id ?? i}
              className="inline-block select-none px-1 font-mono text-sm"
              title={`TC ${r.id || i + 1}`}
            >
              {isPass ? 'O' : 'X'}
            </span>
          )
        })
      )}
    </div>
  )
}

function TestcaseEditableCell({
  results,
  total
}: {
  results: { id: number; isHidden: boolean; result: string }[]
  total: number
}) {
  const [editing, setEditing] = useState(false)
  const passed = results.filter((r) => r.result === 'Accepted').length
  const [inputValue, setInputValue] = useState(String(passed))

  const handleSave = () => {
    const num = Number(inputValue)
    if (isNaN(num) || num < 0 || num > total) {
      toast.error(`Only integers between 0 and ${total} are allowed.`)
      setInputValue(String(passed))
      setEditing(false)
      return
    }

    setInputValue(String(num))
    setEditing(false)
    toast.success('Saved successfully.')
  }

  if (editing) {
    return (
      <div className="flex items-center justify-center gap-1">
        <input
          type="number"
          min={0}
          max={total}
          className="hide-spin-button w-12 rounded border px-1 py-0.5 text-center text-xs"
          value={inputValue}
          autoFocus
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSave()
            }
            if (e.key === 'Escape') {
              setInputValue(String(passed))
              setEditing(false)
            }
          }}
        />
        <span className="text-xs">/{total}</span>
      </div>
    )
  }

  return (
    <div
      className="cursor-pointer text-center text-xs hover:bg-gray-100"
      onClick={() => setEditing(true)}
    >
      {inputValue} / {total}
    </div>
  )
}

export const createColumns = (
  problemData: ProblemData[],
  selectedProblemId: number | null,
  courseId: number,
  assignmentId: number,
  groupId: number,
  isAssignmentFinished: boolean,
  refetch: () => void
): ColumnDef<DataTableScoreSummary>[] => {
  return [
    {
      accessorKey: 'studentId',
      header: () => <p className="font-mono text-xs">Student ID</p>,
      cell: ({ row }) => (
        <div className="text-center text-xs font-medium">
          {row.getValue('studentId')}
        </div>
      )
    },
    {
      id: 'testcases',
      header: () => <p className="text-center font-mono text-xs">Testcase</p>,
      cell: ({ row, table }) => {
        const isFirstRow = table.getRowModel().rows[0].id === row.id
        const results = row.original.testcaseResults ?? []

        const contentWidth = results.length * 16

        return (
          <div className="mx-auto w-[600px]">
            {isFirstRow && (
              <div
                className="line-scrollbar mx-auto w-[600px] overflow-x-auto"
                onScroll={(e) => {
                  const left = e.currentTarget.scrollLeft
                  document
                    .querySelectorAll('.tc-scroll')
                    .forEach((el: unknown) => {
                      ;(el as HTMLElement).scrollLeft = left
                    })
                }}
              >
                <div style={{ width: contentWidth, height: 1 }} />
              </div>
            )}

            <div className="tc-scroll mx-auto w-[600px] overflow-x-hidden">
              <div
                className="inline-flex justify-start"
                style={{ width: contentWidth }}
              >
                <TestcaseCell results={results} />
              </div>
            </div>
          </div>
        )
      }
    },
    {
      id: 'testcase-total',
      header: () => <p className="text-center font-mono text-xs">Total</p>,
      cell: ({ row }) => {
        const results = row.original.testcaseResults ?? []
        const total = results.length
        return <TestcaseEditableCell results={results} total={total} />
      }
    },
    {
      id: 'comment',
      header: () => <p className="text-center font-mono text-xs">Comment</p>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <CommentCell
            groupId={groupId}
            assignmentId={assignmentId}
            userId={row.original.id}
            problemId={selectedProblemId ?? problemData[0].problemId}
          />
        </div>
      )
    },
    {
      id: 'detail',
      header: () => <span className="sr-only">Detail</span>,
      cell: ({ row }) => {
        if (!problemData || problemData.length === 0) {
          return null
        }
        const pid = selectedProblemId ?? problemData[0].problemId
        if (!pid) {
          return (
            <button className="flex w-full justify-center">
              <SquareArrowOutUpRight className="h-4 w-4 text-gray-300" />
            </button>
          )
        }
        if (isAssignmentFinished) {
          return (
            <Link
              href={
                `/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${row.original.id}/problem/${pid}` as const
              }
              target="_blank"
              className="flex justify-center"
            >
              <SquareArrowOutUpRight className="hover:text-primary text-black-500 h-4 w-4" />
            </Link>
          )
        } else {
          return (
            <button className="flex w-full justify-center">
              <SquareArrowOutUpRight className="h-4 w-4 text-gray-300" />
            </button>
          )
        }
      }
    }
  ]
}
