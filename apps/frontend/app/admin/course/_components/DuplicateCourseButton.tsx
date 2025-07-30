'use client'

import { AlertModal } from '@/components/AlertModal'
import { ModalSection } from '@/components/ModalSection'
import { Button } from '@/components/shadcn/button'
import { useState } from 'react'
import { IoCopy } from 'react-icons/io5'
import { toast } from 'sonner'
import { useDataTable } from '../../_components/table/context'

interface DuplicateCourseButtonProps<TPromise> {
  duplicateTarget: (id: number) => Promise<TPromise>
  onSuccess?: () => void
}

export function DuplicateCourseButton<TData extends { id: number }, TPromise>({
  onSuccess,
  duplicateTarget
}: DuplicateCourseButtonProps<TPromise>) {
  const { table } = useDataTable<TData>()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDuplicateButtonClick = () => {
    if (table.getSelectedRowModel().rows.length === 0) {
      return
    }
    setIsDialogOpen(true)
  }

  const handleDuplicateRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const deletePromises = selectedRows.map((row) =>
      duplicateTarget(row.original.id)
    )

    try {
      await Promise.all(deletePromises)
      table.resetRowSelection()
      table.resetPageIndex()
      onSuccess?.()
    } catch {
      toast.error(`Failed to duplicate course`)
    }
  }

  return (
    <AlertModal
      size="md"
      type="confirm"
      title="Duplicate Course"
      trigger={
        <Button
          variant="outline"
          type="button"
          onClick={handleDuplicateButtonClick}
        >
          <IoCopy fontSize={13} color={'#8A8A8A'} />
        </Button>
      }
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      primaryButton={{
        text: 'Duplicate',
        onClick: handleDuplicateRows
      }}
    >
      <ModalSection
        title="Contents that will be Copied"
        description="Are you sure you want to duplicate the selected Course?"
        items={['Title', 'Description', 'Assignments']}
      />
    </AlertModal>
  )
}
