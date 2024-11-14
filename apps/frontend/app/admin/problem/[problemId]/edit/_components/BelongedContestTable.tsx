'use client'

import DataTable from '@/app/admin/_components/table/DataTable'
import DataTableFallback from '@/app/admin/_components/table/DataTableFallback'
import DataTablePagination from '@/app/admin/_components/table/DataTablePagination'
import DataTableRoot from '@/app/admin/_components/table/DataTableRoot'
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { columns, type BelongedContest } from './BelongedContestTableColumns'
import SetToZeroButton from './SetToZeroButton'

const headerStyle = {
  select: '',
  title: 'w-3/5',
  startTime: 'px-0 w-1/5',
  participants: 'px-0 w-1/12',
  isVisible: 'px-0 w-1/12'
}

export function BelongedContestTable({
  problemId,
  onSetToZero
}: {
  problemId: number
  onSetToZero: (data: number[]) => void
}) {
  const [contests, setContests] = useState<BelongedContest[]>([])

  const { data } = useSuspenseQuery(GET_BELONGED_CONTESTS, {
    variables: {
      problemId
    }
  })

  const mappedData: BelongedContest[] = [
    ...data.getContestsByProblemId.upcoming.map((contest) => ({
      id: Number(contest.id),
      title: contest.title,
      state: 'Upcoming',
      problemScore: contest.problemScore,
      totalScore: contest.totalScore,
      isSetToZero: false
    })),
    ...data.getContestsByProblemId.ongoing.map((contest) => ({
      id: Number(contest.id),
      title: contest.title,
      state: 'Ongoing',
      problemScore: contest.problemScore,
      totalScore: contest.totalScore,
      isSetToZero: false
    })),
    ...data.getContestsByProblemId.finished.map((contest) => ({
      id: Number(contest.id),
      title: contest.title,
      state: 'Finished',
      problemScore: contest.problemScore,
      totalScore: contest.totalScore,
      isSetToZero: false
    }))
  ]
  setContests(mappedData)

  return (
    <DataTableRoot data={contests} columns={columns}>
      <DataTable />
      <DataTablePagination showSelection />
      <SetToZeroButton
        onSetToZero={(contestsToSetZero) => {
          setContests((contests) =>
            contests.map((contest) =>
              contestsToSetZero.includes(contest.id)
                ? { ...contest, isSetToZero: true }
                : contest
            )
          )
          onSetToZero(contestsToSetZero)
        }}
      />
    </DataTableRoot>
  )
}

export function ContestTableFallback() {
  return <DataTableFallback columns={columns} headerStyle={headerStyle} />
}
