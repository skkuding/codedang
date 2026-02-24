import { DataTable, DataTableRoot } from '@/app/admin/_components/table'
import { useTranslate } from '@tolgee/react'
import { useMemo, type Dispatch, type SetStateAction } from 'react'
import type { AssignmentProblem } from '../_libs/type'
import { createAssignmentColumns } from '../assignment/_components/AssignmentProblemColumns'

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
  const { t } = useTranslate()
  const columns = useMemo(
    () => createAssignmentColumns(setProblems, disableInput, isExercise, t),
    [setProblems, disableInput, isExercise, t]
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
