import { Button } from "@/components/shadcn/button"
import { Card, CardContent } from "@/components/shadcn/card"
import Link from "next/link"
import { LuArrowRight } from "react-icons/lu"
import Image from "next/image"
import pleaseLogo from '@/public/logos/please.png'
import { safeFetcher } from '@/libs/utils'
import statisticsChart from '@/public/captures/statistics-chart.gif'
import statisticsSubmissions from '@/public/captures/statistics-submissions.gif'
import statisticsLeaderboard from '@/public/captures/statistics-leaderboard.gif'

interface Contest {
  id: number
  title: string
  startTime: string
  endTime: string
}

interface ContestStatisticsProps {
  params: {
    contestId: string
  }
}

export default async function ContestStatistics({ params }: ContestStatisticsProps) {
  const { contestId } = params

  // 대회 정보 가져오기
  const response = await safeFetcher.get(`contest/${contestId}`)
  const contest: Contest = await response.json()

  // 현재 시간과 대회 종료 시간 + 5분 비교
  const currentTime = new Date()
  const endTime = new Date(contest.endTime)
  // TODO: 2025 SKKU 프로그래밍 대회 사용 이후에는 버퍼 시간 없애기
  const endTimeWithBuffer = new Date(endTime.getTime() + 5 * 60 * 1000)
  const isContestFinished = currentTime >= endTimeWithBuffer

  if (!isContestFinished) {
    return (
      <div className="flex flex-col items-center justify-center pb-[120px]">
        <Image className="mt-40" src={pleaseLogo} alt="coming-soon" width={336} />
        <div className="mt-5 text-lg text-gray-600">
          Statistics will be available after {new Date(endTimeWithBuffer).toLocaleString('ko-KR')}
        </div>
        <div className="mt-2 text-base text-gray-500">
          You can check the statistics five minutes after the contest ends.
        </div>
      </div>
    )
  }

  return (
    <div className="pb-[120px]">
      <p className="my-20 text-left text-2xl font-semibold">STATISTICS</p>
      <div className="my-5 text-lg">
        You can check the leaderboard and statistics by time.
      </div>

      <Button className="w-fit text-lg" asChild>
        <Link href="https://leaderboard-statistics.vercel.app/">
          See statistics in new page
          <LuArrowRight className="inline ml-2" />
        </Link>
      </Button>
      {/* Statistics Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
        <Card className="border-none">
          <CardContent
            style={{ boxShadow: '3px 3px 10px 0px rgba(0, 0, 0, 0.15)' }}
            className="flex aspect-square h-[420px] w-full flex-col items-start justify-around gap-3 rounded-[14px] pt-9 text-2xl"
          >
            <div className="w-full rounded-lg flex items-center justify-center mb-4">
              <Image src={statisticsLeaderboard} alt="statistics-leaderboard" width={336}/>
            </div>
            <div className="text-base font-normal text-center text-neutral-600 w-full">
              You can check the leaderboard over time.
            </div>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardContent
            style={{ boxShadow: '3px 3px 10px 0px rgba(0, 0, 0, 0.15)' }}
            className="flex aspect-square h-[420px] w-full flex-col items-start justify-around gap-3 rounded-[14px] pt-9 text-2xl"
          >
            <div className="w-full rounded-lg flex items-center justify-center mb-4">
              <Image src={statisticsChart} alt="statistics-capture-2" width={336} />
            </div>
            <div className="text-base font-normal text-center text-neutral-600 w-full">
              You can view problem-solving trends and ranking changes for each team over time through graphs.
            </div>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardContent
            style={{ boxShadow: '3px 3px 10px 0px rgba(0, 0, 0, 0.15)' }}
            className="flex aspect-square w-full h-[420px] flex-col items-start justify-around gap-3 rounded-[14px] pt-9 text-2xl"
          >
            <div className="w-full rounded-lg flex items-center justify-center mb-4">
              <Image src={statisticsSubmissions} alt="statistics-capture-3" width={336} height={300} />
            </div>
            <div className="text-base font-normal text-center text-neutral-600 w-full">
              You can select teams to view or compare each team's problem-solving summary and submission history.
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
