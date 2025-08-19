import { auth } from '@/libs/auth'
import { fetcherWithAuth } from '@/libs/utils'
import type { ContestTop, ProblemDataTop, ContestOrder } from '@/types/type'
import { getOngoingUpcomingContests } from '../_libs/apis'
import { ContestOverviewLayout } from './_components/ContestOverviewLayout'

interface ContestTopProps {
  params: Promise<{
    contestId: string
  }>
  searchParams: Promise<{
    search: string
  }>
}

export default async function ContestTop(props: ContestTopProps) {
  const searchParams = await props.searchParams
  const session = await auth()
  const search = searchParams.search ?? ''
  const { contestId } = await props.params
  const data: ContestTop = await fetcherWithAuth
    .get(`contest/${contestId}`)
    .json()
  const problemData: ProblemDataTop = await fetcherWithAuth
    .get(`contest/${contestId}/problem`)
    .json()
  const orderedContests: ContestOrder[] = await getOngoingUpcomingContests(
    search,
    session
  )
  const contest: ContestTop = {
    ...data,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    registerDueTime: new Date(data.registerDueTime)
  }

  return (
    <ContestOverviewLayout
      contest={contest}
      isPreview={false}
      problemData={problemData}
      orderedContests={orderedContests}
      session={session}
      search={search}
    />
  )
}
