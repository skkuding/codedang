import { useMemo, type Dispatch, type SetStateAction } from 'react'
import DataTable from '../../_components/table/DataTable'
import DataTableRoot from '../../_components/table/DataTableRoot'
import type { ContestProblem } from '../utils'
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
