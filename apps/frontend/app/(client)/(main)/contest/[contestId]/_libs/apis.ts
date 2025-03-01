import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Contest } from '@/types/type'
import type { Session } from 'next-auth'

// search에 따른 contest list를 가져오는 함수(search가 없으면 모든 contest list를 가져옴)
export const getOngoingUpcomingContests = async (
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
