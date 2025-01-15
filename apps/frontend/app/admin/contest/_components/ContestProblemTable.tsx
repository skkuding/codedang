import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { DataTable, DataTableRoot } from '../../_components/table'
import type { ContestProblem } from '../_libs/schemas'
import { createColumns } from './ContestProblemColumns'

interface ContestProblemTableProps {
  problems: ContestProblem[]
  setProblems: Dispatch<SetStateAction<ContestProblem[]>>
  disableInput: boolean
}

export default function ContestProblemTable({
  problems,
  setProblems,
  disableInput
}: ContestProblemTableProps) {
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
