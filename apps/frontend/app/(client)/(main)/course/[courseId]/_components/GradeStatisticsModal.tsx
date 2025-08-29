'use client'

import { assignmentQueries } from '@/app/(client)/_libs/queries/assignment'
import { assignmentSubmissionQueries } from '@/app/(client)/_libs/queries/assignmentSubmission'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from '@/components/shadcn/chart'
import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import type { Assignment } from '@/types/type'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { MdArrowForwardIos } from 'react-icons/md'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'

const chartConfig = {
  count: {
    label: 'Count'
  }
} satisfies ChartConfig

interface GradeStatisticsModalProps {
  assignment: Assignment
  courseId: number
}

export function GradeStatisticsModal({
  assignment,
  courseId
}: GradeStatisticsModalProps) {
  const { data } = useSuspenseQuery(
    assignmentSubmissionQueries.anonymizedScores({
      assignmentId: assignment.id,
      courseId
    })
  )

  const { data: assignmentProblemRecord } = useSuspenseQuery({
    ...assignmentQueries.record({
      assignmentId: assignment.id
    })
  })

  const isAssignmentProblemRecordValid = Boolean(assignmentProblemRecord)

  const maxScore = assignmentProblemRecord?.assignmentPerfectScore
  const myGradedScore = assignmentProblemRecord?.userAssignmentFinalScore

  // 점수 데이터를 기반으로 히스토그램 데이터 생성
  const generateChartData = useCallback(
    (scores: number[], maxScore: number) => {
      const interval = maxScore / 10
      const userScore = myGradedScore ?? 0

      return Array.from({ length: 10 }, (_, index) => {
        const lowerBound = index * interval
        const upperBound = (index + 1) * interval
        const label = `${lowerBound.toFixed(1)}-${upperBound.toFixed(1)}`

        const count = scores.filter(
          (score) =>
            score >= lowerBound &&
            (index === 9 ? score <= upperBound : score < upperBound)
        ).length

        return {
          score: label,
          count,
          fill:
            userScore >= lowerBound &&
            (index === 9 ? userScore <= upperBound : userScore < upperBound)
              ? '#3b82f6'
              : '#C3C3C3'
        }
      })
    },
    [myGradedScore] // 의존성 배열 추가
  )

  // 통계 계산 함수
  const calculateStatistics = (scores: number[]) => {
    if (!scores.length) {
      return { mean: null, median: null, max: null, min: null }
    }

    const sortedScores = [...scores].sort((a, b) => a - b)
    const mean =
      sortedScores.reduce((sum, score) => sum + score, 0) / scores.length
    const median =
      sortedScores.length % 2 === 0
        ? (sortedScores[sortedScores.length / 2 - 1] +
            sortedScores[sortedScores.length / 2]) /
          2
        : sortedScores[Math.floor(sortedScores.length / 2)]
    const min = sortedScores[0] // 최소값 수정
    const max = sortedScores[sortedScores.length - 1] // 최대값 유지

    return { mean, median, max, min }
  }

  const finalScores = useMemo(() => data.finalScores ?? [], [data.finalScores])

  const chartData = useMemo(() => {
    return generateChartData(finalScores, maxScore ?? 0)
  }, [finalScores, maxScore, generateChartData])

  const finalScoresStats = useMemo(() => {
    return calculateStatistics(finalScores)
  }, [finalScores])

  if (!isAssignmentProblemRecordValid) {
    toast.error('Cannot Load Assignment Information')
    return null
  }

  return (
    <DialogContent
      className="max-w-[95vw] p-4 sm:max-w-2xl sm:p-14"
      onClick={(e) => e.stopPropagation()}
    >
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2 text-lg font-medium">
            <span>Week {assignment.week}</span>
            <MdArrowForwardIos />
            <span className="text-primary">{assignment.title}</span>
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Statistics</span>
          <table
            className="w-full min-w-[300px] max-w-[550px] border-separate text-center text-xs"
            style={{ borderSpacing: 0 }}
          >
            <thead className="bg-primary-light text-white">
              <tr className="border-primary-light border">
                <th className="border-primary-light w-[80px] rounded-tl-md px-2 py-2 text-xs" />
                <th className="border-primary-light px-3 py-2 text-xs font-light">
                  Score
                </th>
                <th className="border-primary-light px-3 py-2 text-xs font-light">
                  Mean
                </th>
                <th className="border-primary-light px-3 py-2 text-xs font-light">
                  Median
                </th>
                <th className="border-primary-light px-3 py-2 text-xs font-light">
                  Min
                </th>
                <th className="border-primary-light rounded-tr-md px-3 py-2 text-xs font-light">
                  Max
                </th>
              </tr>
            </thead>
            <tbody>
              {assignmentProblemRecord?.isFinalScoreVisible && (
                <tr className="text-gray-500">
                  <td className="bg-primary-light flex w-[60px] flex-col items-center rounded-bl-md px-1 py-2 text-xs text-white sm:w-[80px] sm:px-2">
                    Graded
                    {assignmentProblemRecord.autoFinalizeScore && (
                      <span className="text-primary shadow-2xs mt-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium">
                        Auto
                      </span>
                    )}
                  </td>
                  <td className="border-[0.5px] px-3 py-2 text-xs">
                    {myGradedScore}
                  </td>
                  <td className="border-[0.5px] px-3 py-2 text-xs">
                    {finalScoresStats.mean}
                  </td>
                  <td className="border-[0.5px] px-3 py-2 text-xs">
                    {finalScoresStats.median}
                  </td>
                  <td className="border-[0.5px] px-3 py-2 text-xs">
                    {finalScoresStats.min}
                  </td>
                  <td className="border-[0.5px] px-3 py-2 text-xs">
                    {finalScoresStats.max}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="rounded-xs flex h-[200px] w-full max-w-[600px] flex-col items-center sm:h-[281px]">
            <div className="min-h-0 flex-1 overflow-auto">
              <ChartContainer config={chartConfig} className="h-full">
                <BarChart data={chartData} barCategoryGap={10}>
                  <YAxis
                    tickLine={false}
                    axisLine={{
                      stroke: '#E5E5E5'
                    }}
                    tick={{ fontSize: '10px', fill: 'black' }}
                  />
                  <XAxis
                    dataKey="score"
                    tickLine={false}
                    // tickMargin={20}
                    axisLine={{
                      stroke: '#E5E5E5'
                    }}
                    tick={{ fontSize: '8px', fill: 'black' }}
                    tickFormatter={(value) => {
                      return value.replace(/\.0/g, '')
                    }}
                  />
                  <CartesianGrid vertical={false} strokeDasharray="4 4" />
                  <Bar dataKey="count" radius={[10, 10, 0, 0]} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
