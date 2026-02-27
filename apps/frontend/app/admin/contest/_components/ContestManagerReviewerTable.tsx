'use client'

import { useTranslate } from '@tolgee/react'
import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { DataTable, DataTableRoot } from '../../_components/table'
import type { ContestManagerReviewer } from '../_libs/schemas'
import { createColumns } from './ContestManagerReviewerColumns'
import { DeleteManagerReviewerAlert } from './DeleteManagerReviewerAlert'

interface ContestManagerReviewerTableProps {
  managers: ContestManagerReviewer[]
  setManagers: Dispatch<SetStateAction<ContestManagerReviewer[]>>
}

export function ContestManagerReviewerTable({
  managers,
  setManagers
}: ContestManagerReviewerTableProps) {
  const { t } = useTranslate()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteRowId, setDeleteRowId] = useState<number | null>(null)
  const columns = useMemo(
    () => createColumns(setShowDeleteDialog, setManagers, setDeleteRowId, t),
    [setManagers, setDeleteRowId, t]
  )

  return (
    <>
      <DataTableRoot columns={columns} data={managers}>
        <DataTable />
      </DataTableRoot>
      {showDeleteDialog && (
        <DeleteManagerReviewerAlert
          showDeleteDialog={showDeleteDialog}
          setShowDeleteDialog={setShowDeleteDialog}
          setManagers={setManagers}
          deleteRowId={deleteRowId}
        />
      )}
    </>
  )
}
