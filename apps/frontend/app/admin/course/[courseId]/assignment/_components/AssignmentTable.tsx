'use client'

import {
  DataTable,
  DataTableDeleteButton,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { DELETE_ASSIGNMENT } from '@/graphql/assignment/mutations'
import { GET_ASSIGNMENTS } from '@/graphql/assignment/queries'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import { columns } from './AssignmentTableColumns'

interface AssignmentTableProps {
  groupId: string
}

const headerStyle = {
  select: '',
  title: 'w-3/5',
  startTime: 'px-0 w-2/5',
  isVisible: 'px-0 w-1/12'
}

export function AssignmentTable({ groupId }: AssignmentTableProps) {
  const { data } = useSuspenseQuery(GET_ASSIGNMENTS, {
    variables: {
      groupId: Number(groupId),
      take: 300
    }
  })

  const assignments = data.getAssignments.map((assignment) => ({
    ...assignment,
    id: Number(assignment.id)
  }))

  return (
    <DataTableRoot
      data={assignments}
      columns={columns}
      defaultSortState={[{ id: 'startTime', desc: true }]}
    >
      <div className="flex justify-between gap-2">
        <DataTableSearchBar columndId="title" />
        <AssignmentsDeleteButton />
      </div>
      <DataTable
        headerStyle={headerStyle}
        getHref={(data) => `/admin/course/${groupId}/assignment/${data.id}`}
      />
      <DataTablePagination showSelection />
    </DataTableRoot>
  )
}

function AssignmentsDeleteButton() {
  const client = useApolloClient()
  const [deleteAssignment] = useMutation(DELETE_ASSIGNMENT)

  const deleteTarget = (id: number) => {
    return deleteAssignment({
      variables: {
        groupId: 1,
        assignmentId: id
      }
    })
  }

  const onSuccess = () => {
    client.refetchQueries({
      include: [GET_ASSIGNMENTS]
    })
  }

  return (
    <DataTableDeleteButton
      target="assignment"
      deleteTarget={deleteTarget}
      onSuccess={onSuccess}
    />
  )
}

export function AssignmentTableFallback() {
  return <DataTableFallback columns={columns} headerStyle={headerStyle} />
}
