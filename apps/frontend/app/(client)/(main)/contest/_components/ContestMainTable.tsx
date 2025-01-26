import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import type { Session } from 'next-auth'
import { ContestDataTable } from './ContestDataTable'
import { columns } from './ContestMainColumns'

interface ContestProps {
  data: Contest[]
}

const getOngoingUpcomingContests = async () => {
  const data: {
    ongoing: Contest[]
    upcoming: Contest[]
    // search: string
  } = await fetcher.get('contest/ongoing-upcoming').json()
  data.ongoing.forEach((contest) => {
    contest.status = 'ongoing'
  })
  data.upcoming.forEach((contest) => {
    contest.status = 'upcoming'
  })
  return data.ongoing.concat(data.upcoming)
}

// * 'search' 관련 api 작업은 추후 수정 필요
const getOngoingUpcomingContestsRegistered = async () => {
  const data: {
    registeredOngoing: Contest[]
    registeredUpcoming: Contest[]
    ongoing: Contest[]
    upcoming: Contest[]
    // search: string
  } = await fetcherWithAuth
    .get('contest/ongoing-upcoming-with-registered')
    .json()

  data.registeredOngoing.forEach((contest) => {
    contest.isRegistered = true
  })
  data.registeredUpcoming.forEach((contest) => {
    contest.isRegistered = true
  })
  data.ongoing.forEach((contest) => {
    contest.isRegistered = false
  })
  data.upcoming.forEach((contest) => {
    contest.isRegistered = false
  })

  data.registeredOngoing.forEach((contest) => {
    contest.status = 'registeredOngoing'
  })
  data.registeredUpcoming.forEach((contest) => {
    contest.status = 'registeredUpcoming'
  })
  data.ongoing.forEach((contest) => {
    contest.status = 'ongoing'
  })
  data.upcoming.forEach((contest) => {
    contest.status = 'upcoming'
  })

  return data.ongoing.concat(
    data.upcoming.concat(data.registeredOngoing.concat(data.registeredUpcoming))
  )
}

const getFinishedContests = async (search: string, session: Session | null) => {
  const data: ContestProps = await (session ? fetcherWithAuth : fetcher)
    .get('contest/finished', {
      searchParams: {
        search,
        take: '51'
      }
    })
    .json()

  data.data.forEach((contest) => {
    contest.status = 'finished'
  })

  return data.data
}

export async function ContestMainTable({
  search,
  session
}: {
  search: string
  session: Session | null
}) {
  const ContestFinishedData = await getFinishedContests(search, session)
  const ContestOngoingUpcomingData = session
    ? await getOngoingUpcomingContestsRegistered()
    : await getOngoingUpcomingContests()
  const data = ContestOngoingUpcomingData.concat(ContestFinishedData)

  return (
    <ContestDataTable
      data={data}
      columns={columns}
      headerStyle={{
        title: 'text-[#8A8A8A] font-normal text-left w-2/5 md:w-1/2',
        registered: 'text-[#8A8A8A] font-normal w-1/5 md:w-1/6',
        period: 'text-[#8A8A8A] font-normal w-1/5 md:w-1/3'
      }}
      linked
    />
  )
}
