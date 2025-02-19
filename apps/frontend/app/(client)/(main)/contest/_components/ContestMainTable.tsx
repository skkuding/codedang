import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import type { Session } from 'next-auth'
import { ContestDataTable } from './ContestDataTable'
import { columns } from './ContestMainColumns'

interface ContestMainTableProps {
  search: string
  session: Session | null
}

export async function ContestMainTable({
  search,
  session
}: ContestMainTableProps) {
  const contestData = await getOngoingUpcomingContests(search, session)

  return (
    <ContestDataTable
      data={contestData}
      columns={columns}
      headerStyle={{
        title: 'text-[#8A8A8A] font-normal text-left w-2/5 md:w-1/2',
        status: 'text-[#8A8A8A] font-normal w-1/5 md:w-1/6',
        registered: 'text-[#8A8A8A] font-normal w-1/5 md:w-1/6',
        period: 'text-[#8A8A8A] font-normal w-1/5 md:w-1/3'
      }}
      linked
    />
  )
}

const getOngoingUpcomingContests = async (
  search: string,
  session: Session | null
) => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
    finished: Contest[]
  } = await (session ? fetcherWithAuth : fetcher)
    .get('contest', {
      searchParams: {
        search
      }
    })
    .json()

  // NOTE: contest list 에서 'registered~' status 사용x -> 우선 status만 사용
  data.ongoing = data.ongoing.map((contest) => ({
    ...contest,
    // status: contest.isRegistered ? 'registeredOngoing' : 'ongoing'
    status: 'ongoing'
  }))
  data.upcoming = data.upcoming.map((contest) => ({
    ...contest,
    // status: contest.isRegistered ? 'registeredUpcoming' : 'upcoming'
    status: 'upcoming'
  }))
  data.finished = data.finished.map((contest) => ({
    ...contest,
    status: 'finished'
  }))
  return data.upcoming.concat(data.ongoing, data.finished)
}
