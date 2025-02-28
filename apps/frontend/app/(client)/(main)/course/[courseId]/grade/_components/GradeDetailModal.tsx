'use client'

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
  assignmentId: number
  week: number
  courseId: number
}

export function GradeDetailModal({
  assignmentId,
  week,
  courseId
}: GradeDetailModalProps) {
  const { data } = useSuspenseQuery(
    assignmentSubmissionQueries.score({ assignmentId, courseId })
  )

  const maxScore = data?.assignmentPerfectScore ?? 100
  const userScore = data?.userAssignmentScore ?? 0

  const interval = maxScore / 10

  const chartData = Array.from({ length: 10 }, (_, index) => {
    const lowerBound = index * interval
    const upperBound = (index + 1) * interval
    const label = `${lowerBound.toFixed(1)}-${upperBound.toFixed(1)}`

    return {
      score: label,
      count: Math.floor(Math.random() * 500), // 더미 데이터 (추후 get anonymized scores요청 가능한 방법 알게되면 수정예정)
      fill:
        userScore >= lowerBound && userScore < upperBound
          ? '#3b82f6'
          : '#C3C3C3'
    }
  })

  return (
    <DialogContent
      className="p-10 sm:max-w-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <DialogHeader>
        <DialogTitle>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <span className="text-gray-300">Assignment</span>
            <MdArrowForwardIos />
            <span className="text-primary">Week {week}</span>
          </div>
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <span className="text-base font-medium">Statistic</span>
          <table
            className="w-full border-separate text-center text-xs"
            style={{ borderSpacing: 0 }}
          >
            <thead className="bg-primary-light text-white">
              <tr className="border-primary-light border">
                <th className="border-primary-light rounded-tl-md px-3 py-0.5 text-xs" />
                <th className="border-primary-light px-3 py-0.5 text-xs font-light">
                  Score
                </th>
                <th className="border-primary-light px-3 py-0.5 text-xs font-light">
                  Mean
                </th>
                <th className="border-primary-light px-3 py-0.5 text-xs font-light">
                  Min
                </th>
                <th className="border-primary-light rounded-tr-md px-3 py-0.5 text-xs font-light">
                  Max
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-500">
                <td className="bg-primary-light px-3 py-1 text-xs text-white">
                  Submitted
                </td>
                <td className="border-[0.5px] px-3 py-1 text-xs">90</td>
                <td className="border-[0.5px] px-3 py-1 text-xs">80</td>
                <td className="border-[0.5px] px-3 py-1 text-xs">0</td>
                <td className="border-[0.5px] px-3 py-1 text-xs">100</td>
              </tr>
              <tr className="text-gray-500">
                <td className="bg-primary-light rounded-bl-md px-3 py-1 text-xs text-white">
                  Graded
                </td>
                <td className="border-[0.5px] px-3 py-1 text-xs">100</td>
                <td className="border-[0.5px] px-3 py-1 text-xs">85</td>
                <td className="border-[0.5px] px-3 py-1 text-xs">0</td>
                <td className="border-[0.5px] px-3 py-1 text-xs">100</td>
              </tr>
            </tbody>
          </table>
          <div className="flex h-[281px] w-[600px] flex-col items-center rounded px-10">
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
        <div className="flex flex-col gap-1">
          <span className="text-base font-medium">Comment</span>
          <div className="flex-col rounded border p-4">
            <span className="text-xs">
              정말 수고 많았습니다. 문제들을 살펴보니 많이 틀렸네요. 이걸 저렇게
              바꾸고 저걸 이렇게 바꿔보는건 어떨까요? 수고하셨습니다.
              수고하셨습니다. 수고하셨습니다.
            </span>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
