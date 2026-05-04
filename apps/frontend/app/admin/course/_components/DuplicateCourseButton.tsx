'use client'

import { AlertModal } from '@/components/AlertModal'
import { ModalSection } from '@/components/ModalSection'
import { Button } from '@/components/shadcn/button'
import { DUPLICATE_COURSE } from '@/graphql/course/mutation'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useMemo } from 'react'
import { GoAlertFill } from 'react-icons/go'
import { IoCopy } from 'react-icons/io5'
import { toast } from 'sonner'
import { useDataTable } from '../../_components/table/context'

interface DuplicateCourseButtonProps {
  onSuccess: () => void
}
type CourseRow = {
  id: number
  title: string
  code: string
  semester: string
  studentCount: number
}

export function DuplicateCourseButton({
  onSuccess
}: DuplicateCourseButtonProps) {
  const { table } = useDataTable<CourseRow>()
  const [duplicateCourse] = useMutation(DUPLICATE_COURSE)
  const selectedCount = table.getSelectedRowModel().rows.length
  const canDuplicate = selectedCount === 1

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [courseNum, setCourseNum] = useState('')
  const [semester, setSemester] = useState('')
  const [classNum, setClassNum] = useState('')

  const handleDuplicateButtonClick = () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length !== 1) {
      return
    }
    const selectedCourse = selectedRows[0].original
    console.log('selected Course: ', selectedCourse)
    setCourseNum(selectedCourse.title ?? '')
    setSemester(selectedCourse.semester ?? '')
    setClassNum('')
    setIsDialogOpen(true)
  }

  const classNumError = useMemo(() => {
    if (classNum.trim() === '') {
      return 'Class Number must be entered.'
    }
    if (!/^\d+$/.test(classNum)) {
      return 'Class Number must be an integer between 1 and 99.'
    }
    const parsedClassNum = Number(classNum)
    if (parsedClassNum < 1 || parsedClassNum > 99) {
      return 'Class Number must be an integer between 1 and 99.'
    }

    return ''
  }, [classNum])

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
      <div className="max-h-[70vh] w-full min-w-0 overflow-y-auto overflow-x-hidden pr-1">
        <div className="flex w-full min-w-0 flex-col gap-4">
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

          <div className="flex w-full min-w-0 items-start gap-[6px] rounded-md bg-[#FFEBEE] px-[18px] py-[8px]">
            <GoAlertFill
              size={16}
              color="#FF3B2F"
              className="mt-[2px] shrink-0"
            />
            <span className="break-words text-sm text-[#FF3B2F]">
              Course Info, Assignments and Exercises will be duplicated.
            </span>
          </div>

          <div className="flex w-full min-w-0 flex-col gap-4">
            <div className="flex w-full min-w-0 flex-col gap-2">
              <label className="text-sm font-medium">Course Number</label>
              <input
                value={courseNum}
                onChange={(e) => setCourseNum(e.target.value)}
                placeholder="Enter course number"
                className="box-border w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <label className="text-sm font-medium">Semester</label>
              <input
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="Enter semester"
                className="box-border w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <label className="text-sm font-medium">Class Number</label>
              <input
                value={classNum}
                onChange={(e) => setClassNum(e.target.value)}
                placeholder="Enter class number"
                className={`box-border w-full min-w-0 rounded-md border px-3 py-2 text-sm ${
                  classNumError
                    ? 'border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />

              <p
                className={`min-h-[20px] text-sm ${
                  classNumError ? 'text-red-500' : 'invisible'
                }`}
              >
                {classNumError || 'placeholder'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AlertModal>
  )
}
