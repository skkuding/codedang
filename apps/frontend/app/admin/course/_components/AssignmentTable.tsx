'use client'

import {
  DataTable,
  DataTableDeleteButton,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { Button } from '@/components/shadcn/button'
import { DELETE_ASSIGNMENT } from '@/graphql/assignment/mutations'
import { GET_ASSIGNMENTS } from '@/graphql/assignment/queries'
import { useApolloClient, useMutation, useSuspenseQuery } from '@apollo/client'
import Link from 'next/link'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { columns } from './AssignmentTableColumns'

interface AssignmentTableProps {
  groupId: string
  isExercise?: boolean
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
      <div className="flex h-[46px] w-full items-center justify-start gap-[10px]">
        <div className="min-w-0 flex-1">
          <DataTableSearchBar columndId="title" size="lg" />
        </div>

        <div className="flex shrink-0 items-center gap-[10px]">
          <AssignmentsDeleteButton groupId={groupId} isExercise={isExercise} />

          <Button
            variant="default"
            className="h-[46px]! w-[120px] rounded-full"
            asChild
          >
            <Link
              href={
                isExercise
                  ? (`/admin/course/${groupId}/exercise/create` as const)
                  : (`/admin/course/${groupId}/assignment/create` as const)
              }
            >
              <HiMiniPlusCircle className="mr-2 h-5 w-5" />
              <span className="text-lg">Create</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-[28px]">
        <DataTable
          getHref={(data) =>
            isExercise
              ? (`/admin/course/${groupId}/exercise/${data.id}` as const)
              : (`/admin/course/${groupId}/assignment/${data.id}` as const)
          }
          bodyStyle={{ title: 'justify-start' }}
        />
      </div>
      <div className="mt-[40px]">
        <DataTablePagination showSelection />
      </div>
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
  return <DataTableFallback columns={columns} />
}
