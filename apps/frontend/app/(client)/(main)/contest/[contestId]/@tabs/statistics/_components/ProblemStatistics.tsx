'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig
} from '@/components/shadcn/chart'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { fetcherWithAuth } from '@/libs/utils'
import { cn } from '@/libs/utils'
import { Suspense, ErrorBoundary } from '@suspensive/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { SlArrowDown } from 'react-icons/sl'
import { SlArrowRight } from 'react-icons/sl'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  LabelList,
  XAxis,
  YAxis
} from 'recharts'
import { ProblemStatisticsSkeleton } from './StatisticsSkeletons'

interface Problems {
  data: {
    problemId: number
    problem: {
      title: string
    }
  }[]
}

interface Statistics {
  totalSubmissionCount: number
  acceptedSubmissionCount: number
  acceptedRate: number
  averageTrial: number
  firstSolver: {
    id: number
    username: string
  }
  fastestSolver: {
    id: number
    username: string
  }
  userSpeedRank: number | null
  acceptedSubmissionsByLanguage: {
    language: string
    count: number
  }[]
}

interface DistributionAndTimeline {
  contestId: number
  problemId: number
  distribution: {
    totalSubmissions: number
    counts: {
      WA: number
      TLE: number
      MLE: number
      RE: number
      CE: number
      ETC: number
    }
  }
  timeline: {
    intervalMinutes: number
    series: {
      timestamp: string
      accepted: number
      wrong: number
    }[]
  }
}

interface ProblemDetailSectionProps {
  contestId: string
  selectedProblem: number
  problems: Problems['data']
}

export function ProblemStatisticsPage() {
  const { contestId } = useParams<{ contestId: string }>()
  const { data: problemsData } = useSuspenseQuery<{
    contestProblem: Problems['data']
  }>({
    queryKey: ['contest', contestId, 'problems'],
    queryFn: () =>
      fetcherWithAuth.get(`contest/${contestId}/statistics/problems`).json()
  })

  const problems = problemsData?.contestProblem || []
  const [selectedProblem, setSelectedProblem] = useState(problems[0]?.problemId)

  return (
    <div className="flex gap-7">
      <div className="border-1 h-fit w-[276px] shrink-0 rounded-2xl px-4 py-5">
        {problems.map((problem) => (
          <div
            key={problem.problemId}
            className={cn(
              'flex h-10 cursor-pointer items-center justify-between rounded-full pl-2 pr-3',
              selectedProblem === problem.problemId && 'bg-primary text-white'
            )}
            onClick={() => setSelectedProblem(problem.problemId)}
          >
            <div className="flex min-w-0 items-center">
              <div
                className={cn(
                  'm-2 h-1 w-1 shrink-0 rounded-full bg-black',
                  selectedProblem === problem.problemId && 'bg-white'
                )}
              />
              <span className="mr-1 truncate">{problem.problem.title}</span>
            </div>
            <SlArrowRight className="h-3 w-3 shrink-0" />
          </div>
        ))}
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense
          key={selectedProblem}
          fallback={<ProblemStatisticsSkeleton />}
        >
          <ProblemDetailSection
            contestId={contestId}
            selectedProblem={selectedProblem}
            problems={problems}
          />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

function ProblemDetailSection({
  contestId,
  selectedProblem,
  problems
}: ProblemDetailSectionProps) {
  const { data: statistics } = useSuspenseQuery<Statistics>({
    queryKey: ['statistics', contestId, selectedProblem],
    queryFn: () =>
      fetcherWithAuth
        .get(`contest/${contestId}/statistics/problem/${selectedProblem}`)
        .json()
  })

  const { data: distributionAndTimeline } =
    useSuspenseQuery<DistributionAndTimeline>({
      queryKey: ['graph', contestId, selectedProblem],
      queryFn: () =>
        fetcherWithAuth
          .get(
            `contest/${contestId}/problem/${selectedProblem}/statistics/graph`
          )
          .json()
    })

  const total = distributionAndTimeline?.distribution?.totalSubmissions || 1
  const distributionChartData = [
    {
      type: 'WA',
      counts: `${(distributionAndTimeline?.distribution?.counts?.WA * 100) / total}`,
      fill: '#FED7DE'
    },
    {
      type: 'TLE',
      counts: `${(distributionAndTimeline?.distribution?.counts?.TLE * 100) / total}`,
      fill: '#FFF5CC'
    },
    {
      type: 'RE',
      counts: `${(distributionAndTimeline?.distribution?.counts?.RE * 100) / total}`,
      fill: '#D8F4DE'
    },
    {
      type: 'MLE',
      counts: `${(distributionAndTimeline?.distribution?.counts?.MLE * 100) / total}`,
      fill: '#C4F6FF'
    },
    {
      type: 'CE',
      counts: `${(distributionAndTimeline?.distribution?.counts?.CE * 100) / total}`,
      fill: '#AFCDFD'
    },
    {
      type: 'etc.',
      counts: `${(distributionAndTimeline?.distribution?.counts?.ETC * 100) / total}`,
      fill: '#E0D9FC'
    }
  ]
  const timelineChartData =
    (distributionAndTimeline?.timeline?.series?.length || 0) > 0
      ? distributionAndTimeline.timeline.series.map((item, index) => {
          const totalMinutes =
            (index + 1) *
            (distributionAndTimeline.timeline.intervalMinutes || 0)
          const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
          const mm = String(totalMinutes % 60).padStart(2, '0')
          return {
            time: `${hh}:${mm}`,
            accepted: ((item.accepted * 100) / total).toFixed(1),
            wrong: ((item.wrong * 100) / total).toFixed(1)
          }
        })
      : []

  const chartConfig = {
    accepted: {
      label: 'Accepted',
      color: '#29CC6A'
    },
    wrong: {
      label: 'Wrong Answer',
      color: '#FC5555'
    }
  } satisfies ChartConfig

  return (
    <div>
      <p className="mb-4 text-2xl font-semibold tracking-[-0.72px]">
        {
          problems.find((problem) => problem.problemId === selectedProblem)
            ?.problem.title
        }
      </p>
      <div className="mb-3 flex h-[98px] gap-2">
        <div className="w-1/4 min-w-0 rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-1 text-[13px] font-normal tracking-[-0.42px]">
            Total Submission
          </p>
          <p className="text-2xl font-semibold tracking-[-0.72px]">
            {statistics.totalSubmissionCount.toLocaleString('ko-KR') || '-'}
          </p>
        </div>
        <div className="w-1/4 min-w-0 rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-1 text-[13px] font-normal tracking-[-0.42px]">
            Correct Answers
          </p>
          <p className="text-2xl font-semibold tracking-[-0.72px]">
            {statistics.acceptedSubmissionCount.toLocaleString('ko-KR') || '-'}
          </p>
        </div>
        <div className="w-1/4 min-w-0 rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-1 text-[13px] font-normal tracking-[-0.42px]">
            Correct Answers Rate
          </p>
          <p className="text-2xl font-semibold tracking-[-0.72px]">
            {(statistics.acceptedRate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="w-1/4 min-w-0 rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-1 text-[13px] font-normal tracking-[-0.42px]">
            Average Attempt
          </p>
          <p className="text-2xl font-semibold tracking-[-0.72px]">
            {statistics.averageTrial.toLocaleString('ko-KR') || '-'}
          </p>
        </div>
      </div>
      <div className="mb-5 flex h-[188px] gap-2">
        <div className="w-1/4 min-w-0 rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-1 text-[13px] font-normal tracking-[-0.42px]">
            First Solver
          </p>
          <p className="truncate text-2xl font-semibold tracking-[-0.72px]">
            {statistics?.firstSolver?.username || '-'}
          </p>
        </div>
        <div className="w-1/4 min-w-0 rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-1 text-[13px] font-normal tracking-[-0.42px]">
            Fastest Solver
          </p>
          <p className="truncate text-2xl font-semibold tracking-[-0.72px]">
            {statistics?.fastestSolver?.username || '-'}
          </p>
        </div>
        <div className="w-1/4 min-w-0 rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-1 text-[13px] font-normal tracking-[-0.42px]">
            User Speed Rank
          </p>
          <p className="text-2xl font-semibold tracking-[-0.72px]">
            {statistics?.userSpeedRank
              ? statistics.userSpeedRank.toLocaleString('ko-KR') +
                (['st', 'nd', 'rd'][
                  ((((statistics.userSpeedRank + 90) % 100) - 10) % 10) - 1
                ] || 'th')
              : '-'}
          </p>
        </div>
        <div className="w-1/4 min-w-0 rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-3 text-[13px] font-normal tracking-[-0.42px]">
            Correct Answers by Language
          </p>
          {statistics?.acceptedSubmissionsByLanguage?.length ? (
            statistics.acceptedSubmissionsByLanguage.map((language) => (
              <div
                className="mb-1 flex justify-between text-sm font-medium"
                key={language.language}
              >
                <div className="text-color-neutral-40 flex items-center">
                  <div className="bg-color-neutral-40 m-2 h-1 w-1 rounded-full" />
                  {language.language}
                </div>
                {language.count.toLocaleString('ko-KR')}
              </div>
            ))
          ) : (
            <p className="mt-[-8px] text-2xl font-semibold">-</p>
          )}
        </div>
      </div>
      <div className="mb-[112px] flex h-[338px] gap-2">
        <div className="flex w-1/2 min-w-0 flex-col rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-[14px] text-[13px] font-normal tracking-[-0.42px]">
            Incorrect Answer Distribution
          </p>
          <ChartContainer config={chartConfig} className="h-[230px]">
            <BarChart
              accessibilityLayer
              data={distributionChartData}
              margin={{
                top: 20
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="2 3" />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={{ stroke: 'transparent' }}
                tickFormatter={(value) => `${value}%`}
                width={50}
              />
              <XAxis
                dataKey="type"
                tickLine={false}
                tickMargin={6}
                axisLine={true}
                tick={{ fill: 'black' }}
                tickFormatter={(value) => value.slice(0, 4)}
                fontSize={14}
                fontWeight={500}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, coordinate }) => {
                  if (active && payload && payload.length && payload[0].value) {
                    return (
                      <div
                        style={{
                          position: 'absolute',
                          left: coordinate?.x,
                          top: coordinate?.y,
                          transform: 'translate(-50%, -120%)'
                        }}
                        className="border-1 border-primary text-primary flex h-[25px] w-[118px] items-center justify-center rounded-full bg-white"
                      >
                        {Math.round(
                          (payload[0].value *
                            (distributionAndTimeline?.distribution
                              ?.totalSubmissions || 0)) /
                            100
                        ).toLocaleString('ko-KR')}{' '}
                        Wrong Answer
                      </div>
                    )
                  }
                }}
                formatter={(value: number) =>
                  Math.round(
                    (value *
                      distributionAndTimeline.distribution.totalSubmissions) /
                      100
                  )
                }
              />
              <Bar dataKey="counts" radius={[8, 8, 0, 0]} barSize={24}>
                <LabelList
                  position="top"
                  offset={6}
                  className="fill-black"
                  fontSize={12}
                  fontWeight={400}
                  formatter={(value: number) => `${Math.round(value)}%`}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
          <Popover>
            <PopoverTrigger className="group mt-auto w-full justify-end">
              <div className="bg-color-neutral-99 flex h-[30px] items-center justify-between rounded-lg px-3 text-xs">
                <div className="flex">
                  <div className="border-r-1 flex items-center gap-1 pr-2">
                    Wrong Answer
                    <div className="bg-level-1 rounded-xs h-3 w-3" />
                  </div>
                  <div className="border-r-1 flex items-center gap-1 px-2">
                    Time Limit Exceeded
                    <div className="bg-level-2 rounded-xs h-3 w-3" />
                  </div>
                  <div className="flex items-center gap-1 px-2">
                    Runtime Error
                    <div className="bg-level-3 rounded-xs h-3 w-3" />
                  </div>
                </div>
                <SlArrowDown className="h-3 w-3 transition-transform duration-0 group-data-[state=open]:rotate-180" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-102 flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="bg-level-1 rounded-xs h-3 w-3" />
                Wrong Answer
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-level-2 rounded-xs h-3 w-3" />
                Time Limit Exceeded
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-level-3 rounded-xs h-3 w-3" />
                Runtime Error
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-level-4 rounded-xs h-3 w-3" />
                Memory Limit Exceeded
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-color-blue-80 rounded-xs h-3 w-3" />
                Compile Error
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-level-5 rounded-xs h-3 w-3" />
                etc.
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex w-1/2 min-w-0 flex-col rounded-xl p-5 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]">
          <p className="text-primary mb-[14px] text-[13px] font-normal tracking-[-0.42px]">
            Trends in Submission
          </p>
          <ChartContainer config={chartConfig} className="h-[230px]">
            <LineChart
              accessibilityLayer
              data={timelineChartData}
              margin={{
                top: 20,
                left: 12,
                right: 21
              }}
            >
              <CartesianGrid vertical={true} strokeDasharray="2 3" />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={{ stroke: 'transparent' }}
                tickFormatter={(value) => `${value}%`}
                width={40}
              />
              <XAxis
                dataKey="time"
                interval={0}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'black' }}
                tickMargin={4}
                fontSize={14}
                fontWeight={500}
              />
              <ChartTooltip
                cursor={false}
                content={({ active, payload, coordinate }) => {
                  if (
                    active &&
                    payload &&
                    payload.length &&
                    payload[0].value &&
                    payload[1].value
                  ) {
                    return (
                      <div
                        style={{
                          position: 'absolute',
                          left: coordinate?.x,
                          top: coordinate?.y,
                          transform: 'translate(-50%, -120%)'
                        }}
                        className="border-1 border-primary text-primary flex h-[50px] w-[118px] items-center justify-center rounded-full bg-white"
                      >
                        {Math.round(
                          (payload[0].value *
                            (distributionAndTimeline?.distribution
                              ?.totalSubmissions || 0)) /
                            100
                        ).toLocaleString('ko-KR')}{' '}
                        Accepted Answer
                        <br />
                        {Math.round(
                          (payload[1].value *
                            (distributionAndTimeline?.distribution
                              ?.totalSubmissions || 0)) /
                            100
                        ).toLocaleString('ko-KR')}{' '}
                        Wrong Answer
                      </div>
                    )
                  }
                }}
                formatter={(value: number) =>
                  Math.round(
                    (value *
                      distributionAndTimeline.distribution.totalSubmissions) /
                      100
                  )
                }
              />
              <Line
                dataKey="wrong"
                type="linear"
                stroke="var(--color-wrong)"
                strokeWidth={2}
                dot={{
                  r: 6,
                  fill: 'white',
                  strokeWidth: 2,
                  stroke: 'var(--color-wrong)'
                }}
              />
              <Line
                dataKey="accepted"
                type="linear"
                stroke="var(--color-accepted)"
                strokeWidth={2}
                dot={{
                  r: 6,
                  fill: 'white',
                  strokeWidth: 2,
                  stroke: 'var(--color-accepted)'
                }}
              />
            </LineChart>
          </ChartContainer>
          <div className="bg-color-neutral-99 mt-auto flex h-[30px] w-fit items-center justify-end rounded-lg px-3 text-xs">
            <div className="border-r-1 flex h-fit items-center gap-1 pr-2">
              Accepted
              <div className="bg-flowkit-green rounded-xs h-3 w-3" />
            </div>
            <div className="flex items-center gap-1 pl-2">
              Wrong Answer
              <div className="bg-flowkit-red rounded-xs h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
