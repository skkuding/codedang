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
import { columns } from './AssignmentTableColumns'

interface AssignmentTableProps {
  groupId: string
  isExercise?: boolean
}

const headerStyle = {
  select: '',
  title: 'w-1/2',
  startTime: 'px-0 w-2/5',
  week: 'px-0 w-1/5',
  isVisible: 'px-0 w-1/12'
}

export function AssignmentTable({
  groupId,
  isExercise = false
}: AssignmentTableProps) {
  const { data } = useSuspenseQuery(GET_ASSIGNMENTS, {
    variables: {
      groupId: Number(groupId),
      take: 300,
      isExercise
    }
  })

  const assignments = data.assignments.map((assignment) => ({
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
        <AssignmentsDeleteButton groupId={groupId} isExercise={isExercise} />
      </div>
      <DataTable
        headerStyle={headerStyle}
        getHref={(data) =>
          isExercise
            ? (`/admin/course/${groupId}/exercise/${data.id}` as const)
            : (`/admin/course/${groupId}/assignment/${data.id}` as const)
        }
      />
      <DataTablePagination showSelection />
    </DataTableRoot>
  )
}

interface AssignmentsDeleteButtonProp {
  groupId: string
  isExercise?: boolean
}

function AssignmentsDeleteButton({
  groupId,
  isExercise = false
}: AssignmentsDeleteButtonProp) {
  const client = useApolloClient()
  const [deleteAssignment] = useMutation(DELETE_ASSIGNMENT)

  const deleteTarget = (id: number) => {
    return deleteAssignment({
      variables: {
        groupId: Number(groupId),
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
      target={isExercise ? 'exercise' : 'assignment'}
      deleteTarget={deleteTarget}
      onSuccess={onSuccess}
    />
  )
}

export function AssignmentTableFallback() {
  return <DataTableFallback columns={columns} headerStyle={headerStyle} />
}
