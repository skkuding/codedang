'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { AlertModal } from '@/components/AlertModal'
import { ModalSection } from '@/components/ModalSection'
import { Button } from '@/components/shadcn/button'
import { DUPLICATE_COURSE } from '@/graphql/course/mutation'
import type { SemesterSeason } from '@/types/type'
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
    setCourseNum(selectedCourse.title ?? '')
    setSemester('')
    setClassNum('')
    setIsDialogOpen(true)
  }

  const courseNumError = useMemo(() => {
    if (courseNum.trim() === '') {
      return 'Course Number must be entered.'
    }
    return ''
  }, [courseNum])

  const semesterError = useMemo(() => {
    if (semester.trim() === '') {
      return 'Semester must be selected.'
    }
    return ''
  }, [semester])

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

  const isFormValid = useMemo(() => {
    return !courseNumError && !semesterError && !classNumError
  }, [courseNumError, semesterError, classNumError])

  const semesterItems = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const seasons: SemesterSeason[] = ['Spring', 'Summer', 'Fall', 'Winter']
    const month = new Date().getMonth() + 1

    let currentSeasonIdx = 0
    let baseYear = currentYear
    if (month >= 3 && month <= 5) {
      currentSeasonIdx = 0
    } else if (month >= 6 && month <= 8) {
      currentSeasonIdx = 1
    } else if (month >= 9 && month <= 11) {
      currentSeasonIdx = 2
    } else {
      if (month <= 2) {
        baseYear = baseYear - 1
      }
      currentSeasonIdx = 3
    }

    return Array.from({ length: 5 }, (_, i) => {
      const seasonIdx = (currentSeasonIdx + i) % 4
      const yearOffset = Math.floor((currentSeasonIdx + i) / 4)
      return `${baseYear + yearOffset} ${seasons[seasonIdx]}`
    })
  }, [])

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
      size="lg"
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
        onClick: handleDuplicateRows,
        disabled: !isFormValid
      }}
    >
      <div className="max-h-[70vh] w-full min-w-0 overflow-y-auto overflow-x-hidden pr-2">
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
                className={`box-border w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm ${
                  courseNumError
                    ? 'border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {courseNumError && (
                <p className="text-sm text-red-500">{courseNumError}</p>
              )}
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <label className="text-sm font-medium">Semester</label>
              <OptionSelect
                options={semesterItems}
                value={semester}
                onChange={(value) => setSemester(value)}
                placeholder="Select semester"
                className="rounded-md font-normal"
              />
              {semesterError && (
                <p className="text-sm text-red-500">{semesterError}</p>
              )}
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

              {classNumError && (
                <p className="text-sm text-red-500">{classNumError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AlertModal>
  )
}
