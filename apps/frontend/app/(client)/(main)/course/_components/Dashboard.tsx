import { fetcher, fetcherWithAuth } from '@/libs/utils'
import type { Assignment, CalendarAssignment } from '@/types/type'
import type { Session } from 'next-auth'
import { DashboardCalendar } from './DashboardCalendar'

const getAssignments = async () => {
  const data: {
    ongoing: Assignment[] //Course type 정의 후 수정
    upcoming: Assignment[]
  } = await fetcher.get('assignment/ongoing-upcoming').json() //group으로 해야하나 assignment로 해야하나!!
  data.ongoing.forEach((assignment) => {
    assignment.status = 'ongoing'
  })
  data.upcoming.forEach((assignment) => {
    assignment.status = 'upcoming'
  })
  return data.ongoing.concat(data.upcoming)
}

const getRegisteredAssignments = async () => {
  //현재 등록된 assignments를 불러온다.
  const data: {
    registeredOngoing: Assignment[] //Course Interface를 정의한 뒤 수정해야한다.
    registeredUpcoming: Assignment[]
  } = await fetcherWithAuth
    .get('assignment/ongoing-upcoming-with-registered')
    .json()
  data.registeredOngoing.forEach((assignment) => {
    assignment.status = 'registeredOngoing'
  })
  data.registeredUpcoming.forEach((assignment) => {
    assignment.status = 'registeredUpcoming'
  })
  return data.registeredOngoing.concat(data.registeredUpcoming)
}

export async function Dashboard({ session }: { session?: Session | null }) {
  const data: CalendarAssignment[] = (
    session ? await getRegisteredAssignments() : await getAssignments()
  ).map((assignment) => ({
    title: assignment.title,
    start: assignment.startTime,
    end: assignment.endTime
  }))
  return <DashboardCalendar data={data} />
}
