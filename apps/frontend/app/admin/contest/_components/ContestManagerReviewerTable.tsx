import { useMemo, type Dispatch, type SetStateAction } from 'react'
import { DataTable, DataTableRoot } from '../../_components/table'
import type { ContestManagerReviewer } from '../_libs/schemas'
import { createColumns } from './ContestManagerReviewerColumns'

interface ContestManagerReviewerTableProps {
  managers: ContestManagerReviewer[]
  setManagers: Dispatch<SetStateAction<ContestManagerReviewer[]>>
}

export function ContestManagerReviewerTable({
  managers,
  setManagers
}: ContestManagerReviewerTableProps) {
  const columns = useMemo(() => createColumns(setManagers), [setManagers])

  return (
    <DataTableRoot columns={columns} data={managers}>
      <DataTable />
    </DataTableRoot>
  )
}
