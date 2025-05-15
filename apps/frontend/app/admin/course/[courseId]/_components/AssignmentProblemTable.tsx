import { DataTable, DataTableRoot } from '@/app/admin/_components/table'
import { useMemo, type Dispatch, type SetStateAction } from 'react'
import type { AssignmentProblem } from '../_libs/type'
import { createColumns } from '../assignment/_components/AssignmentProblemColumns'

interface AssignmentProblemTableProps {
  problems: AssignmentProblem[]
  setProblems: Dispatch<SetStateAction<AssignmentProblem[]>>
  disableInput: boolean
}

export function AssignmentProblemTable({
  problems,
  setProblems,
  disableInput
}: AssignmentProblemTableProps) {
  const columns = useMemo(
    () => createColumns(setProblems, disableInput),
    [setProblems, disableInput]
  )

  return (
    <DataTableRoot
      columns={columns}
      data={problems}
      defaultPageSize={20}
      defaultSortState={[{ id: 'order', desc: false }]}
    >
      <DataTable showFooter={true} />
    </DataTableRoot>
  )
}
