'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { Button } from '@/components/shadcn/button'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/shadcn/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { Skeleton } from '@/components/shadcn/skeleton'
import { Switch } from '@/components/shadcn/switch'
import {
  AUTO_FINALIZE_SCORE,
  UPDATE_ASSIGNMENT
} from '@/graphql/assignment/mutations'
import {
  GET_ASSIGNMENT,
  GET_ASSIGNMENT_SCORE_SUMMARIES
} from '@/graphql/assignment/queries'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { cn } from '@/libs/utils'
import { useMutation, useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CSVLink } from 'react-csv'
import { toast } from 'sonner'
import { createColumns } from './ColumnsOverall'

interface ParticipantTableProps {
  groupId: number
  assignmentId: number
}

export function ParticipantTableOverall({
  groupId,
  assignmentId
}: ParticipantTableProps) {
  const assignmentData = useQuery(GET_ASSIGNMENT, {
    variables: {
      groupId,
      assignmentId
    }
  }).data?.getAssignment

  const [currentView, setCurrentView] = useState<'final' | 'auto'>('final')
  const [viewOpen, setViewOpen] = useState(false)
  const [updateAssignment] = useMutation(UPDATE_ASSIGNMENT)
  const [autoFinalizeScore] = useMutation(AUTO_FINALIZE_SCORE)

  const summaries = useQuery(GET_ASSIGNMENT_SCORE_SUMMARIES, {
    variables: { groupId, assignmentId, take: 300 }
  })
  const summariesData = summaries.data?.getAssignmentScoreSummaries.map(
    (item) => ({
      ...item,
      id: item.userId
    })
  )

  useEffect(() => {
    if (summariesData && summariesData.length > 0) {
      const hasAnyFinalScore = summariesData.some((item) =>
        item.problemScores.some((problem) => problem.finalScore !== null)
      )
      setCurrentView(hasAnyFinalScore ? 'final' : 'auto')
    }
  }, [summariesData?.length])

  const problems = useQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId, assignmentId }
  })

  const problemData = problems.data?.getAssignmentProblems
    .slice()
    .sort((a, b) => a.order - b.order)

  const [revealFinalScore, setRevealFinalScore] = useState(
    assignmentData?.isFinalScoreVisible
  )

  useEffect(() => {
    setRevealFinalScore(assignmentData?.isFinalScoreVisible)
  }, [assignmentData?.isFinalScoreVisible])

  const formatScore = (score: number): string => {
    const fixedScore = Math.floor(score * 1000) / 1000
    return fixedScore.toString()
  }

  const assignmentTitle = assignmentData?.title

  const now = dayjs()

  const isAssignmentFinished = now.isAfter(
    dayjs(assignmentData?.dueTime ?? assignmentData?.endTime)
  )

  const fileName = assignmentTitle
    ? `${assignmentTitle.replace(/\s+/g, '_')}.csv`
    : `course-${groupId}/assignment-${assignmentId}-participants.csv`

  const problemList =
    problemData?.map((problem) => ({
      problemId: problem.problemId,
      maxScore: problem.score,
      title: problem.problem.title,
      order: problem.order
    })) || []

  const problemHeaders = problemList.map((problem, index) => {
    const problemLabel = String.fromCharCode(65 + index)
    return {
      label: `${problemLabel}(MAX ${problem.maxScore})`,
      key: `problems[${index}].maxScore`
    }
  })

  const headers = [
    { label: 'Student Id', key: 'studentId' },
    { label: 'Name', key: 'realName' },
    {
      label: `Total Score(MAX ${summaries?.data?.getAssignmentScoreSummaries[0]?.assignmentPerfectScore || 0})`,
      key: 'finalScore'
    },

    ...problemHeaders
  ]

  const csvData =
    summaries.data?.getAssignmentScoreSummaries.map((user) => {
      const userProblemScores = problemList.map((problem) => {
        const scoreData = user.problemScores.find(
          (ps) => ps.problemId === problem.problemId
        )

        return {
          maxScore: scoreData ? formatScore(scoreData.score) : '-'
        }
      })

      return {
        studentId: user.studentId,
        realName: user.realName,
        rawScore: user.userAssignmentScore
          ? `${user.userAssignmentScore}`
          : '-',
        finalScore: user.userAssignmentFinalScore
          ? `${user.userAssignmentFinalScore}`
          : '-',
        problems: userProblemScores
      }
    }) || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between gap-4">
        <UtilityPanel
          title="Show Scores to Students"
          description="When enabled, students can view their scores for this assignment."
        >
          <Switch
            onCheckedChange={async (checked) => {
              if (checked && !isAssignmentFinished) {
                toast.error(
                  'Score cannot be revealed before assignment due time.'
                )
                return
              }
              setRevealFinalScore(checked)
              await updateAssignment({
                variables: {
                  groupId,
                  input: {
                    id: assignmentId,
                    isFinalScoreVisible: checked
                  }
                },
                onCompleted: () => {
                  toast.success('Successfully updated')
                }
              })
            }}
            checked={revealFinalScore}
            className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
          />
        </UtilityPanel>
        <UtilityPanel
          title="Download as a CSV"
          description="Download grading results, showing scores by student and problem"
        >
          <CSVLink
            data={csvData}
            headers={headers}
            filename={fileName}
            className="bg-primary flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            Download
          </CSVLink>
        </UtilityPanel>
      </div>
      <div className="flex items-end justify-between">
        <p className="mb-3 font-medium">
          <span className="text-primary font-bold">
            {summariesData?.length}
          </span>{' '}
          Participants
        </p>
        <div className="flex gap-2">
          {currentView === 'auto' && (
            <Button
              onClick={async () => {
                try {
                  const result = await autoFinalizeScore({
                    variables: { groupId, assignmentId }
                  })

                  const gradedCount = result.data?.autoFinalizeScore
                  const expectedCount =
                    (summariesData?.length || 0) * (problemData?.length || 0)

                  if (gradedCount === expectedCount) {
                    toast.success('Successfully graded all submissions')
                  } else {
                    toast.success(`Graded ${gradedCount} submissions`)
                  }

                  summaries.refetch()
                  setCurrentView('final')
                } catch (error) {
                  if (error instanceof Error) {
                    toast.error(error.message)
                  } else {
                    toast.error('Failed to apply auto grading')
                  }
                }
              }}
            >
              Apply to Final Score
            </Button>
          )}
          <Popover open={viewOpen} onOpenChange={setViewOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-[200px] justify-between"
              >
                {currentView === 'final' ? 'Final Score' : 'Auto Graded Score'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      value="final"
                      onSelect={() => {
                        setCurrentView('final')
                        setViewOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          currentView === 'final' ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      Final Score
                    </CommandItem>
                    <CommandItem
                      value="auto"
                      onSelect={() => {
                        setCurrentView('auto')
                        setViewOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          currentView === 'auto' ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      Auto Graded Score
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <DataTableRoot
        data={summariesData || []}
        columns={createColumns(
          problemData || [],
          groupId,
          assignmentId,
          isAssignmentFinished,
          currentView,
          summaries.refetch
        )}
        enablePagination={false}
      >
        <DataTableSearchBar columndId="realName" placeholder="Search Name" />
        <DataTable />
      </DataTableRoot>
    </div>
  )
}

export function ParticipantTableFallback() {
  return (
    <div>
      <Skeleton className="mb-3 h-[24px] w-2/12" />
      <DataTableFallback
        columns={createColumns([], 0, 0, true, 'final', () => {})}
      />
    </div>
  )
}

interface UtilityPanelProps {
  children: React.ReactNode
  title: string
  description: string
}

function UtilityPanel({ children, title, description }: UtilityPanelProps) {
  return (
    <div className="flex h-24 w-full items-center justify-between rounded-xl border border-[#D8D8D8] bg-white px-5 py-4">
      <div className="text-[#737373]">
        <p className="text-xl font-semibold">{title}</p>
        <p className="text-base">{description}</p>
      </div>
      {children}
    </div>
  )
}
