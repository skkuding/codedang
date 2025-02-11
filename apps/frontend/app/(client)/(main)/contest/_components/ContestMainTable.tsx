import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import type { Session } from 'next-auth'
import { ContestDataTable } from './ContestDataTable'
import { columns } from './ContestMainColumns'

interface ContestMainTableProps {
  search: string
  session: Session | null
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

  data.ongoing = data.ongoing.map((contest) => ({
    ...contest,
    status: contest.isRegistered ? 'registeredOngoing' : 'ongoing'
  }))
  data.upcoming = data.upcoming.map((contest) => ({
    ...contest,
    status: contest.isRegistered ? 'registeredUpcoming' : 'upcoming'
  }))
  data.finished = data.finished.map((contest) => ({
    ...contest,
    status: 'finished'
  }))
  return data.upcoming.concat(data.ongoing, data.finished)
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
