import { baseUrl } from '@/lib/vars'
import type { Contest } from '@/types/type'
import ContestTable from './_components/ContestTable'

export default async function Contest() {
  const unfinishedRes = await fetch(baseUrl + '/contest')
  const unfinishedData = await unfinishedRes.json()

  const finishedRes = await fetch(baseUrl + '/contest/finished?take=3', {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const finishedData = await finishedRes.json()

  unfinishedData.ongoing.forEach((contest: { status: string }) => {
    contest.status = 'ongoing'
  })
  unfinishedData.upcoming.forEach((contest: { status: string }) => {
    contest.status = 'upcoming'
  })
  finishedData.finished.forEach((contest: { status: string }) => {
    contest.status = 'finished'
  })
  const contests: Contest[] = [
    ...unfinishedData.upcoming,
    ...unfinishedData.ongoing,
    ...finishedData.finished
  ]
  console.log(contests)

  return (
    <>
      {/* TODO: Add search bar */}
      <ContestTable data={contests} />
    </>
  )
}
