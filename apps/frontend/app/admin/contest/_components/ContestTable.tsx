'use client'

import { DELETE_CONTEST } from '@/graphql/contest/mutations'
import { GET_CONTESTS } from '@/graphql/contest/queries'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import { DataTable } from '../../_components/table/DataTable'
import { DataTableDeleteButton } from '../../_components/table/DataTableDeleteButton'
import { DataTableFallback } from '../../_components/table/DataTableFallback'
import { DataTablePagination } from '../../_components/table/DataTablePagination'
import { DataTableRoot } from '../../_components/table/DataTableRoot'
import { DataTableSearchBar } from '../../_components/table/DataTableSearchBar'
import { columns } from './ContestTableColumns'
import { DuplicateContestButton } from './DuplicateContestButton'

const headerStyle = {
  select: '',
  title: 'w-3/5',
  startTime: 'px-0 w-1/5',
  participants: 'px-0 w-1/12',
  isVisible: 'px-0 w-1/12'
}

export function ContestTable() {
  const { data } = useSuspenseQuery(GET_CONTESTS, {
    variables: {
      groupId: 1,
      take: 300
    }
  })

  const contests = data.getContests.map((contest) => ({
    ...contest,
    id: Number(contest.id)
  }))

  return (
    <DataTableRoot
      data={contests}
      columns={columns}
      defaultSortState={[{ id: 'startTime', desc: true }]}
    >
      <div className="flex gap-2">
        <DataTableSearchBar columndId="title" />
        <DuplicateContestButton />
        <ContestsDeleteButton />
      </div>
      <DataTable
        headerStyle={headerStyle}
        getHref={(data) => `/admin/contest/${data.id}`}
      />
      <DataTablePagination showSelection />
    </DataTableRoot>
  )
}

function ContestsDeleteButton() {
  const client = useApolloClient()
  const [deleteContest] = useMutation(DELETE_CONTEST)

  const deleteTarget = (id: number) => {
    return deleteContest({
      variables: {
        groupId: 1,
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
    />
  )
}

export function ContestTableFallback() {
  return <DataTableFallback columns={columns} headerStyle={headerStyle} />
}
