'use client'

import {
  DataTable,
  DataTableFallback,
  DataTableRoot
} from '@/app/admin/_components/table'
import { GET_BELONGED_ASSIGNMENTS } from '@/graphql/assignment/queries'
import { useSuspenseQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import {
  createColumns,
  type BelongedContest
} from './BelongedContestTableColumns'

export function BelongedContestTable({
  problemId,
  onSelectedAssignmentsChange
}: {
  problemId: number
  onSelectedAssignmentsChange: (assignments: BelongedContest[]) => void
}) {
  const [assignments, setAssignments] = useState<BelongedContest[]>([])
  const { t } = useTranslate()
  const { data } = useSuspenseQuery(GET_BELONGED_ASSIGNMENTS, {
    variables: {
      problemId
    },
    // TODO: 필요시 refetch 하도록 수정
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (data) {
      const mappedData: BelongedContest[] = [
        ...data.getAssignmentsByProblemId.upcoming.map((assignment) => ({
          id: Number(assignment.id),
          title: assignment.title,
          courseNum: assignment.group.courseInfo?.courseNum || 'N/A',
          groupId: Number(assignment.group.id)
        })),
        ...data.getAssignmentsByProblemId.ongoing.map((assignment) => ({
          id: Number(assignment.id),
          title: assignment.title,
          courseNum: assignment.group.courseInfo?.courseNum || 'N/A',
          groupId: Number(assignment.group.id)
        })),
        ...data.getAssignmentsByProblemId.finished.map((assignment) => ({
          id: Number(assignment.id),
          title: assignment.title,
          courseNum: assignment.group.courseInfo?.courseNum || 'N/A',
          groupId: Number(assignment.group.id)
        }))
      ]
      setAssignments(mappedData)
    }
  }, [data])

  const columns = createColumns(onSelectedAssignmentsChange, t)

  return (
    <DataTableRoot data={assignments} columns={columns}>
      <DataTable />
    </DataTableRoot>
  )
}

export function BelongedContestTableFallback() {
  const columns = createColumns(
    () => {},
    () => ''
  )
  return <DataTableFallback withSearchBar={false} columns={columns} />
}
