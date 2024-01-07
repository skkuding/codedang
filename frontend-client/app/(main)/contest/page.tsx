import { baseUrl } from '@/lib/vars'
import type { Contest } from '@/types/type'
import ContestTable from './_components/ContestTable'

export default async function Contest() {
  const unfinishedRes = await fetch(baseUrl + '/contest')
  const unfinishedData = await unfinishedRes.json()

  const finishedRes = await fetch(baseUrl + '/contest/finished?take=10')
  const finishedData = await finishedRes.json()

  const contests: Contest[] = [
    ...unfinishedData.upcoming,
    ...unfinishedData.ongoing,
    ...finishedData.finished
  ]

  return (
    <>
      {/* TODO: Add search bar */}
      <ContestTable data={contests} />
    </>
  )
}
