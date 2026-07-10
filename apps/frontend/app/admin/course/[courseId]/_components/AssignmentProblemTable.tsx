import { DataTable, DataTableRoot } from '@/app/admin/_components/table'
import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { createAssignmentColumns } from '../../[courseId]/(home)/assignment/_components/AssignmentProblemColumns'
import type { AssignmentProblem } from '../_libs/type'

interface AssignmentProblemTableProps {
  problems: AssignmentProblem[]
  setProblems: Dispatch<SetStateAction<AssignmentProblem[]>>
  disableInput: boolean
  isExercise?: boolean
}

export function AssignmentProblemTable({
  problems,
  setProblems,
  disableInput,
  isExercise = false
}: AssignmentProblemTableProps) {
  const columns = useMemo(
    () => createAssignmentColumns(setProblems, disableInput, isExercise),
    [setProblems, disableInput, isExercise]
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
