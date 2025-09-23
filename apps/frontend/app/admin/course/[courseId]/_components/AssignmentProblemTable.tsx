import { DataTable, DataTableRoot } from '@/app/admin/_components/table'
import { useMemo, type Dispatch, type SetStateAction } from 'react'
import type { AssignmentProblem } from '../_libs/type'
import { createAssignmentColumns } from '../assignment/_components/AssignmentProblemColumns'
import { createExerciseColumns } from '../exercise/_components/ExerciseProblemColumns'

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
    () =>
      isExercise
        ? createExerciseColumns(setProblems, disableInput)
        : createAssignmentColumns(setProblems, disableInput),
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
