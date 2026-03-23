'use client'

import { AlertModal } from '@/components/AlertModal'
import { ModalSection } from '@/components/ModalSection'
import { Button } from '@/components/shadcn/button'
import { DUPLICATE_COURSE } from '@/graphql/course/mutation'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { GoAlertFill } from 'react-icons/go'
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
  const selectedCount = table.getSelectedRowModel().rows.length
  const canDuplicate = selectedCount === 1

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [courseNum, setCourseNum] = useState('')
  const [semester, setSemester] = useState('')
  const [classNum, setClassNum] = useState('')

  const handleDuplicateButtonClick = () => {
    if (table.getSelectedRowModel().rows.length !== 1) {
      return
    }
    setIsDialogOpen(true)
  }

  const handleDuplicateRows = async () => {
    const selectedRows = table.getSelectedRowModel().rows

    console.log('selected row:', selectedRows)
    console.log('selected row original:', selectedRows[0]?.original)
    console.log('groupId:', selectedRows[0]?.original.id)

    const duplicatePromises = selectedRows.map((row) =>
      duplicateTarget(row.original.id)
    )

    try {
      await Promise.all(duplicatePromises)
      table.resetRowSelection()
      table.resetPageIndex()
      onSuccess()
    } catch (error: unknown) {
      console.error('duplicate error:', error)

      if (error instanceof Error) {
        toast.error(error.message)
        return
      }

      toast.error('Failed to duplicate course')
    }
  }

  const duplicateTarget = (id: number) => {
    return duplicateCourse({
      variables: {
        groupId: id,
        input: {
          classNum: Number(classNum),
          courseNum,
          semester
        }
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
          disabled={!canDuplicate}
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
        title="Courses that will be Copied"
        description="Make sure to review the courses that will be duplicated."
        items={[
          table
            .getSelectedRowModel()
            .rows.map((row) => row.original.title)
            .join(', ')
        ]}
      />
      <div className="flex h-[37px] w-full items-center gap-[6px] bg-[#FFEBEE] px-[18px] py-[8px]">
        <GoAlertFill size={16} color="#FF3B2F" />
        <span className="text-sm text-[#FF3B2F]">
          Course Info, Assignments and Exercises will be duplicated.
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Course Number</label>
          <input
            value={courseNum}
            onChange={(e) => setCourseNum(e.target.value)}
            placeholder="Enter course number"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Semester</label>
          <input
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="Enter semester"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Class Number</label>
        <input
          value={classNum}
          onChange={(e) => setClassNum(e.target.value)}
          placeholder="Enter class number"
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
    </AlertModal>
  )
}
