'use client'

import { DELETE_CONTEST } from '@/graphql/contest/mutations'
import { GET_CONTESTS } from '@/graphql/contest/queries'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import {
  DataTable,
  DataTableDeleteButton,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '../../_components/table'
import { columns } from './ContestTableColumns'

const headerStyle = {
  select: '',
  title: 'w-3/5',
  startTime: 'px-0 w-1/5',
  participants: 'px-0 w-1/12'
}

export function ContestTable() {
  const { data } = useSuspenseQuery(GET_CONTESTS, {
    variables: {
      take: 300
    }
  })

  const contests = data.getContests.map((contest) => ({
    ...contest,
    id: Number(contest.id)
  }))
  const now = new Date()

  const contestsWithStatus = contests.map((contest) => {
    const startTime = new Date(contest.startTime)
    const endTime = new Date(contest.endTime)
    let status = 'Upcoming'

    if (now >= startTime && now <= endTime) {
      status = 'Ongoing'
    } else if (now > endTime) {
      status = 'Finished'
    }

    return {
      ...contest,
      status
    }
  })

  return (
    <DataTableRoot
      data={contestsWithStatus}
      columns={columns}
      defaultSortState={[{ id: 'status', desc: true }]}
    >
      <div className="mb-6 flex justify-between">
        <DataTableSearchBar columndId="title" />
        <ContestsDeleteButton />
      </div>
      <div className="space-y-[42px]">
        <DataTable
          getHref={(data) => `/admin/contest/${data.id}/leaderboard`}
          bodyStyle={{ title: 'justify-start' }}
        />
        <DataTablePagination showSelection />
      </div>
    </DataTableRoot>
  )
}

function ContestsDeleteButton() {
  const client = useApolloClient()
  const [deleteContest] = useMutation(DELETE_CONTEST)

  const deleteTarget = (id: number) => {
    return deleteContest({
      variables: {
        contestId: id
      }
    })
  }

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_CONTESTS]
    })
  }

  return (
    <DataTableDeleteButton
      target="contest"
      deleteTarget={deleteTarget}
      onSuccess={onSuccess}
      className="h-9 w-12"
    />
  )
}

export function ContestTableFallback() {
  return <DataTableFallback columns={columns} headerStyle={headerStyle} />
}
