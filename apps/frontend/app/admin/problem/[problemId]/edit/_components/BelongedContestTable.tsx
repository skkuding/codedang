'use client'

import DataTable from '@/app/admin/_components/table/DataTable'
import DataTableFallback from '@/app/admin/_components/table/DataTableFallback'
import DataTableRoot from '@/app/admin/_components/table/DataTableRoot'
import { GET_BELONGED_CONTESTS } from '@/graphql/contest/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useEffect, useState } from 'react'
import { columns, type BelongedContest } from './BelongedContestTableColumns'
import RevertScoreButton from './RevertScoreButton'
import SetToZeroButton from './SetToZeroButton'

export function BelongedContestTable({
  problemId,
  onSetToZero,
  onRevertScore
}: {
  problemId: number
  onSetToZero: (data: number[]) => void
  onRevertScore: () => void
}) {
  const [contests, setContests] = useState<BelongedContest[]>([])

  const { data } = useSuspenseQuery(GET_BELONGED_CONTESTS, {
    variables: {
      problemId
    },
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (data) {
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
    }
  }, [data])

  return (
    <DataTableRoot data={contests} columns={columns}>
      <DataTable />
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
      <RevertScoreButton
        onRevertScore={() => {
          setContests(
            contests.map((contest) => ({ ...contest, isSetToZero: false }))
          )
          onRevertScore()
        }}
      />
    </DataTableRoot>
  )
}

export function BelongedContestTableFallback() {
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
