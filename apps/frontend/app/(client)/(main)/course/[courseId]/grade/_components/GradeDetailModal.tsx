'use client'

import type {
  AssignmentGrade,
  GetAssignmentGradesResponse
} from '@/app/(client)/_libs/apis/assignmentSubmission'
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
import { safeFetcherWithAuth } from '@/libs/utils'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'
import { MdArrowForwardIos } from 'react-icons/md'
import { Bar, CartesianGrid, XAxis, BarChart, YAxis } from 'recharts'

interface ProblemScore {
  problemId: number
  score: number
  maxScore: number
  finalScore: number | null
}

interface AssignmentDetail {
  submittedProblemCount: number
  totalProblemCount: number
  userAssignmentScore: number
  assignmentPerfectScore: number
  userAssignmentFinalScore: number
  problemScores: ProblemScore[]
}

const chartConfig = {
  count: {
    label: 'Count'
  }
} satisfies ChartConfig

interface GradeDetailModalProps {
  courseId: number
  gradedAssignment: AssignmentGrade
}

export function GradeDetailModal({
  courseId,
  gradedAssignment
}: GradeDetailModalProps) {
  const { data } = useSuspenseQuery(
    assignmentSubmissionQueries.anonymizedScores({
      assignmentId: gradedAssignment.id,
      courseId
    })
  )

  const maxScore = gradedAssignment.assignmentPerfectScore
  const mySubmittedScore = gradedAssignment.userAssignmentJudgeScore
  const myGradedScore = gradedAssignment.userAssignmentFinalScore

  // 점수 데이터를 기반으로 히스토그램 데이터 생성
  const generateChartData = useCallback(
    (scores: number[], maxScore: number) => {
      const interval = maxScore / 10
      const userScore = myGradedScore ?? mySubmittedScore ?? 0 // myGradedScore가 null이면 mySubmittedScore 사용

      return Array.from({ length: 10 }, (_, index) => {
        const lowerBound = index * interval
        const upperBound = (index + 1) * interval
        const label = `${lowerBound.toFixed(1)}-${upperBound.toFixed(1)}`

        const count = scores.filter(
          (score) => score >= lowerBound && score < upperBound
        ).length

        return {
          score: label,
          count,
          fill:
            userScore >= lowerBound && userScore < upperBound
              ? '#3b82f6'
              : '#C3C3C3'
        }
      })
    },
    [myGradedScore, mySubmittedScore] // 의존성 배열 추가
  )

  // 통계 계산 함수
  const calculateStatistics = (scores: number[]) => {
    if (!scores.length) {
      return { mean: null, median: null, max: null }
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
    const min = sortedScores[sortedScores.length - 1]
    const max = sortedScores[sortedScores.length - 1]

    return { mean, median, max, min }
  }

  // scores와 finalScores의 데이터 가공 (useMemo로 감싸기)
  const scores = useMemo(() => data.scores ?? [], [data.scores])
  const finalScores = useMemo(() => data.finalScores ?? [], [data.finalScores])

  const chartData = useMemo(() => {
    if (finalScores.length > 0) {
      return generateChartData(finalScores, maxScore)
    }
    return generateChartData(scores, maxScore)
  }, [finalScores, scores, maxScore, generateChartData])

  const scoresStats = useMemo(() => calculateStatistics(scores), [scores])
  const finalScoresStats = useMemo(
    () => calculateStatistics(finalScores),
    [finalScores]
  )

  return (
    <DialogContent
      className="p-14 sm:max-w-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2 text-lg font-medium">
            <span>Assignment</span>
            <MdArrowForwardIos />
            <span className="text-primary">Week {gradedAssignment.week}</span>
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Statistic</span>
          <table
            className="w-[550px] border-separate text-center text-xs"
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
              <tr className="text-gray-500">
                <td className="bg-primary-light w-[80px] px-2 py-2 text-xs text-white">
                  Submitted
                </td>
                <td className="border-[0.5px] px-3 py-2 text-xs">
                  {mySubmittedScore}
                </td>
                <td className="border-[0.5px] px-3 py-2 text-xs">
                  {scoresStats.mean}
                </td>
                <td className="border-[0.5px] px-3 py-2 text-xs">
                  {scoresStats.median}
                </td>
                <td className="border-[0.5px] px-3 py-2 text-xs">
                  {scoresStats.min}
                </td>
                <td className="border-[0.5px] px-3 py-2 text-xs">
                  {scoresStats.mean}
                </td>
              </tr>
              <tr className="text-gray-500">
                <td className="bg-primary-light w-[80px] rounded-bl-md px-2 py-2 text-xs text-white">
                  Graded
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
                  {finalScoresStats.mean}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="-ml-9 flex h-[281px] w-[600px] flex-col items-center rounded">
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
                    // tick={{ fontSize: '8px' }} // ✅ 글자 크기 10px로 설정
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
