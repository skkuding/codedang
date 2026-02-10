import { Card, CardContent, CardHeader } from '@/components/shadcn/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { cn, fetcherWithAuth } from '@/libs/utils'
import tailwindConfig from '@/tailwind.config'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Dot } from 'lucide-react'
import { useParams } from 'next/navigation'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface Timeline {
  problemLabel: string
  solvingStartTime: string
  solvingEndTime: string
  solvingDuration: number
}

interface ProblemAnalysis {
  problemLabel: string
  attemptCount: number
  successPenalty: number | null
  wrongAttemptCount: number | null
  wrongPenalty: number | null
  problemPenalty: number | null
  isSolved: boolean
}

interface Submission {
  submissionTime: string
  problemLabel: string
  result: string
  language: string
  isSolved: boolean
}

interface UserDetail {
  user: {
    rank: number
    username: string
    totalSolved: number
    totalPenalty: number
    problemAnalysis: ProblemAnalysis[]
    timeline: Timeline[]
    submissionHistory: Submission[]
  }
}

const timeToSeconds = (timeStr: string) => {
  const [hrs, mins, secs] = timeStr.split(':').map(Number)
  return hrs * 3600 + mins * 60 + secs
}

const secondsToTime = (totalSeconds: number) => {
  const hrs = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function UserAnalysisContent({ curUserId }: { curUserId: number }) {
  const { contestId } = useParams<{ contestId: string }>()

  const { data: rawData } = useSuspenseQuery<UserDetail>({
    queryKey: ['statistics', contestId, 'user analysis', `${curUserId}`],
    queryFn: () =>
      fetcherWithAuth
        .get(`contest/${contestId}/statistics/user/${curUserId}`)
        .json()
  })

  const userData = rawData.user

  const chartData = userData.timeline.map((item) => ({
    ...item,
    startSeconds: timeToSeconds(item.solvingStartTime)
  }))

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex justify-between font-medium">
        <div className="flex w-full flex-col gap-2">
          <span className="truncate text-2xl">{userData.username}</span>
          <div className="bg-color-neutral-99 text-color-neutral-40 flex w-fit gap-2 rounded-full px-5 py-2">
            <span>Final Rank</span>
            <span className="text-primary">
              {`${userData.rank}${
                userData.rank % 100 >= 11 && userData.rank % 100 <= 13
                  ? 'th'
                  : ['th', 'st', 'nd', 'rd'][userData.rank % 10] || 'th'
              }`}
            </span>
            <span className="text-line">|</span>
            <span>Penalty</span>
            <span className="text-primary">- {userData.totalPenalty}</span>
            <span className="text-line">|</span>
            <span>Total Solved</span>
            <span className="text-primary">{userData.totalSolved}</span>
          </div>
        </div>
      </div>
      <Card className="flex w-full flex-col gap-3 rounded-xl border-none p-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)]">
        <CardHeader className="flex flex-row items-start justify-between p-0">
          <span className="text-primary text-base font-medium">
            Penalty Analysis
          </span>
          <span className="text-color-red-60 font-semibold">
            Total - {userData.totalPenalty}
          </span>
        </CardHeader>
        {userData.problemAnalysis.length > 0 && (
          <CardContent className="flex flex-col gap-1 p-0">
            {userData.problemAnalysis.map((analysis) => (
              <div key={analysis.problemLabel} className="flex gap-1">
                <div className="min-w-0 flex-1">
                  <div className="flex gap-2 truncate font-light">
                    <div className="flex items-center">
                      <Dot />
                      <span className="font-medium">{`${analysis.problemLabel} :`}</span>
                    </div>
                    {analysis.successPenalty && (
                      <span className="text-color-neutral-40">{`${analysis.successPenalty}m elapsed`}</span>
                    )}
                    {analysis.wrongAttemptCount && (
                      <span className="text-color-red-60">{`${analysis.wrongAttemptCount} attempts`}</span>
                    )}
                    {analysis.wrongPenalty && (
                      <span className="text-color-red-60">{`(-${analysis.wrongPenalty})`}</span>
                    )}
                  </div>
                </div>
                {analysis.problemPenalty && (
                  <span className="text-color-red-60 font-medium">{`-${analysis.problemPenalty}`}</span>
                )}
              </div>
            ))}
          </CardContent>
        )}
      </Card>
      <Card className="flex w-full flex-col gap-3 rounded-xl border-none p-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)]">
        <CardHeader className="text-primary p-0 text-base font-medium">
          Problem-Solving Timeline
        </CardHeader>
        {userData.timeline.length > 0 ? (
          <CardContent
            className={`h-[${100 * userData.timeline.length}px] p-0`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 5, right: 40, left: -20, bottom: 5 }}
                barSize={32}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke={tailwindConfig.theme.extend.colors.line.DEFAULT}
                />
                <XAxis
                  type="number"
                  domain={[0, 'dataMax + 300']}
                  tickFormatter={secondsToTime}
                  className="font-mono text-[10px] text-gray-400"
                  stroke={tailwindConfig.theme.extend.colors.line.DEFAULT}
                />
                <YAxis
                  dataKey="problemLabel"
                  type="category"
                  tick={{
                    fontSize: 13,
                    fontWeight: 600,
                    fill: tailwindConfig.theme.extend.colors.line.DEFAULT
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const data = payload[0].payload as Timeline
                      return (
                        <div className="border-primary text-primary rounded-lg border bg-white p-3 shadow-2xl">
                          <p className="mb-1 text-sm font-medium">
                            Problem {data.problemLabel}
                          </p>
                          <div className="space-y-1 text-xs">
                            <p>Start Time: {data.solvingStartTime}</p>
                            <p>End Time: {data.solvingEndTime}</p>
                            <hr className="border-primary my-1" />
                            <p className="text-primary">
                              Duration: {Math.floor(data.solvingDuration / 60)}m{' '}
                              {data.solvingDuration % 60}s
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="startSeconds"
                  stackId="problem"
                  fill="transparent"
                />
                <Bar
                  dataKey="solvingDuration"
                  stackId="problem"
                  radius={[0, 4, 4, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={tailwindConfig.theme.extend.colors.primary.light}
                    />
                  ))}
                  <LabelList
                    dataKey="solvingDuration"
                    position="right"
                    formatter={(val: number) => `${Math.floor(val / 60)}m`}
                    className="fill-gray-500 text-[11px] font-medium"
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        ) : (
          <CardContent className="text-color-neutral-60 p-0 text-base font-medium">
            There is no timeline to figure
          </CardContent>
        )}
      </Card>
      <Card className="flex w-full flex-col gap-3 rounded-xl border-none p-5 shadow-[0px_4px_20px_0px_rgba(53,78,116,0.10)]">
        <CardHeader className="text-primary p-0 text-base font-medium">
          Submission History
        </CardHeader>
        <CardContent className="p-0">
          {userData.submissionHistory.length > 0 ? (
            <Table>
              <TableHeader className="text-base! font-medium!">
                <TableRow>
                  <TableHead className="w-[100px]">Time</TableHead>
                  <TableHead>Problem</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead className="text-right">Language</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-base! font-medium!">
                {userData.submissionHistory
                  .sort((a, b) =>
                    a.submissionTime.localeCompare(b.submissionTime)
                  )
                  .map((submission) => (
                    <TableRow key={submission.submissionTime}>
                      <TableCell className="py-6! text-color-neutral-40">
                        {submission.submissionTime}
                      </TableCell>
                      <TableCell className={'py-6! text-center'}>
                        {submission.problemLabel}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'py-2! text-center',
                          submission.result === 'Accepted'
                            ? 'text-flowkit-green'
                            : 'text-flowkit-red'
                        )}
                      >
                        {submission.result}
                      </TableCell>
                      <TableCell className="py-2! text-color-neutral-60 text-right">
                        {submission.language}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-color-neutral-60 text-xs">
              There is no submission history
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
