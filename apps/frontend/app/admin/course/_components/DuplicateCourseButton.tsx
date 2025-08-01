'use client'

import { AlertModal } from '@/components/AlertModal'
import { ModalSection } from '@/components/ModalSection'
import { Button } from '@/components/shadcn/button'
import { DUPLICATE_COURSE } from '@/graphql/course/mutation'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { IoCopy } from 'react-icons/io5'
import { toast } from 'sonner'
import { useDataTable } from '../../_components/table/context'

interface DuplicateCourseButtonProps {
  onSuccess: () => void
}

export function DuplicateCourseButton({
  onSuccess
}: DuplicateCourseButtonProps) {
  const { table } = useDataTable<{ id: number; title: string }>()
  const [duplicateCourse] = useMutation(DUPLICATE_COURSE)

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDuplicateButtonClick = () => {
    if (table.getSelectedRowModel().rows.length === 0) {
      return
    } else {
      console.log(table.getSelectedRowModel().rows.length)
    }
    setIsDialogOpen(true)
  }

  const handleDuplicateRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows
    const duplicatePromises = selectedRows.map((row) =>
      duplicateTarget(row.original.id)
    )

    try {
      await Promise.all(duplicatePromises)
      table.resetRowSelection()
      table.resetPageIndex()
      onSuccess()
    } catch {
      toast.error('Failed to duplicate course')
    }
  }

  const duplicateTarget = (id: number) => {
    return duplicateCourse({
      variables: {
        groupId: id
      }
    })
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
        description="Make sure to review the contents that will be duplicated."
        items={['Title', 'Description', 'Assignments']}
      />
      <ModalSection
        title="Courses that will be Copied"
        description="Make sure to review the courses that will be duplicated."
        items={[
          table
            .getSelectedRowModel()
            .rows.map((row) => row.original.title)
            .join(', ')
        ]}
      />
    </AlertModal>
  )
}
