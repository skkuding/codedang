'use client'

import DataTable from '@/app/admin/_components/table/DataTable'
import DataTableFallback from '@/app/admin/_components/table/DataTableFallback'
import DataTablePagination from '@/app/admin/_components/table/DataTablePagination'
import DataTableRoot from '@/app/admin/_components/table/DataTableRoot'
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import { useSuspenseQuery } from '@apollo/client'
import { columns, type BelongedContest } from './BelongedContestTableColumns'
import SetToZeroButton from './SetToZeroButton'

const headerStyle = {
  select: '',
  title: 'w-3/5',
  startTime: 'px-0 w-1/5',
  participants: 'px-0 w-1/12',
  isVisible: 'px-0 w-1/12'
}

export function BelongedContestTable({ problemId }: { problemId: number }) {
  const { data } = useSuspenseQuery(GET_BELONGED_CONTESTS, {
    variables: {
      problemId
    }
  })

  const contests: BelongedContest[] = [
    ...data.getContestsByProblemId.upcoming.map((contest) => ({
      id: Number(contest.id),
      title: contest.title,
      state: 'Upcoming',
      problemScore: contest.problemScore,
      totalScore: contest.totalScore
    })),
    ...data.getContestsByProblemId.ongoing.map((contest) => ({
      id: Number(contest.id),
      title: contest.title,
      state: 'Ongoing',
      problemScore: contest.problemScore,
      totalScore: contest.totalScore
    })),
    ...data.getContestsByProblemId.finished.map((contest) => ({
      id: Number(contest.id),
      title: contest.title,
      state: 'Finished',
      problemScore: contest.problemScore,
      totalScore: contest.totalScore
    }))
  ]

  return (
    <DataTableRoot data={contests} columns={columns}>
      <DataTable />
      <DataTablePagination showSelection />
      <SetToZeroButton />
    </DataTableRoot>
  )
}

export function ContestTableFallback() {
  return <DataTableFallback columns={columns} headerStyle={headerStyle} />
}
