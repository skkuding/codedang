import { Button } from '@/components/shadcn/button'
import { Card, CardContent } from '@/components/shadcn/card'
import { auth } from '@/libs/auth'
import statisticsChart from '@/public/captures/statistics-chart.gif'
import statisticsLeaderboard from '@/public/captures/statistics-leaderboard.gif'
import statisticsSubmissions from '@/public/captures/statistics-submissions.gif'
import { getTranslate } from '@/tolgee/server'
import Image from 'next/image'
import Link from 'next/link'
import { LuArrowRight } from 'react-icons/lu'
import { getContest } from '../leaderboard/_libs/apis/getContest'
import { getContestLeaderboard } from '../leaderboard/_libs/apis/getContestLeaderboard'

interface ContestStatisticsProps {
  params: Promise<{
    contestId: string
  }>
}

export default async function ContestStatistics(props: ContestStatisticsProps) {
  const { contestId } = await props.params
  const session = await auth()
  const username = session?.user?.username
  const t = await getTranslate()

  // If contest is not finished or has frozen records, throw error to show error.tsx
  const [contestLeaderboard, contest] = await Promise.all([
    getContestLeaderboard({
      contestId: parseInt(contestId)
    }),
    getContest({ contestId: parseInt(contestId) })
  ])
  if (new Date(contest.endTime) > new Date()) {
    throw new Error('Contest not finished')
  }

  // TODO: should change to check if the contest is frozen, not problem records (inefficient implementation)
  const hasFrozenRecords = contestLeaderboard.leaderboard.some((user) =>
    user.problemRecords.some((record) => record.isFrozen)
  )

  if (hasFrozenRecords) {
    throw new Error('Leaderboard has frozen records')
  }

  const statisticsUrl = username
    ? (`https://leaderboard-statistics.vercel.app/?username=${username}` as const)
    : ('https://leaderboard-statistics.vercel.app/' as const)

  return (
    <div className="pb-[120px]">
      <p className="my-20 text-left text-2xl font-semibold">
        {t('statistics_title')}
      </p>
      <div className="my-5 text-lg">
        {t('leaderboard_statistics_description')}
      </div>

      <Button className="w-fit text-lg" asChild>
        <Link href={statisticsUrl}>
          {t('see_statistics_in_new_page')}
          <LuArrowRight className="ml-2 inline" />
        </Link>
      </Button>

      {/* Statistics Feature Cards */}
      <div className="my-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-none">
          <CardContent
            style={{ boxShadow: '3px 3px 10px 0px rgba(0, 0, 0, 0.15)' }}
            className="flex aspect-square h-[420px] w-full flex-col items-start justify-around gap-3 rounded-[14px] pt-9 text-2xl"
          >
            <div className="mb-4 flex w-full items-center justify-center rounded-lg">
              <Image
                src={statisticsLeaderboard}
                alt="statistics-leaderboard"
                width={336}
              />
            </div>
            <div className="w-full text-center text-base font-normal text-neutral-600">
              {t('check_leaderboard_over_time')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardContent
            style={{ boxShadow: '3px 3px 10px 0px rgba(0, 0, 0, 0.15)' }}
            className="flex aspect-square h-[420px] w-full flex-col items-start justify-around gap-3 rounded-[14px] pt-9 text-2xl"
          >
            <div className="mb-4 flex w-full items-center justify-center rounded-lg">
              <Image
                src={statisticsChart}
                alt="statistics-capture-2"
                width={336}
              />
            </div>
            <div className="w-full text-center text-base font-normal text-neutral-600">
              {t('view_problem_solving_trends')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none">
          <CardContent
            style={{ boxShadow: '3px 3px 10px 0px rgba(0, 0, 0, 0.15)' }}
            className="flex aspect-square h-[420px] w-full flex-col items-start justify-around gap-3 rounded-[14px] pt-9 text-2xl"
          >
            <div className="mb-4 flex w-full items-center justify-center rounded-lg">
              <Image
                src={statisticsSubmissions}
                alt="statistics-capture-3"
                width={336}
                height={300}
              />
            </div>
            <div className="w-full text-center text-base font-normal text-neutral-600">
              {t('select_teams_view_summary')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
