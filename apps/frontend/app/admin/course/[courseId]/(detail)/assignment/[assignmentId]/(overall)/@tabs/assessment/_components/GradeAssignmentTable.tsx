'use client'

import {
  DataTable,
  DataTableFallback,
  DataTablePagination,
  DataTableRoot,
  DataTableSearchBar
} from '@/app/admin/_components/table'
import { GET_ASSIGNMENTS } from '@/graphql/assignment/queries'
import { useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import { columns } from './GradeAssignmentTableColumns'

interface AssignmentTableProps {
  groupId: string
}

export function GradeAssignmentTable({ groupId }: AssignmentTableProps) {
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
      </div>
      <DataTable
        getHref={(data) =>
          `/admin/course/${groupId}/grade/assignment/${data.id}` as Route
        }
      />
      <DataTablePagination />
    </DataTableRoot>
  )
}

export function GradeAssignmentTableFallback() {
  return <DataTableFallback columns={columns} />
}
