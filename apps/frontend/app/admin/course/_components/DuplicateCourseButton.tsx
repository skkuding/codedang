'use client'

import { OptionSelect } from '@/app/admin/_components/OptionSelect'
import { AlertModal } from '@/components/AlertModal'
import { ModalSection } from '@/components/ModalSection'
import { Button } from '@/components/shadcn/button'
import { CREATE_WHITE_LIST, DUPLICATE_COURSE } from '@/graphql/course/mutation'
import type { SemesterSeason } from '@/types/type'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { useMemo } from 'react'
import { GoAlertFill } from 'react-icons/go'
import { IoCopy } from 'react-icons/io5'
import { toast } from 'sonner'
import { useDataTable } from '../../_components/table/context'
import type { RosterRow } from './StudentRosterModal'
import { StudentRosterModal } from './StudentRosterModal'

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
  const [createWhitelist] = useMutation(CREATE_WHITE_LIST)
  const selectedCount = table.getSelectedRowModel().rows.length
  const canDuplicate = selectedCount === 1

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [courseNum, setCourseNum] = useState('')
  const [semester, setSemester] = useState('')
  const [classNum, setClassNum] = useState('')
  const [roster, setRoster] = useState<RosterRow[]>([])
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false)

  const handleDuplicateButtonClick = () => {
    const selectedRows = table.getSelectedRowModel().rows
    if (selectedRows.length !== 1) {
      return
    }
    const selectedCourse = selectedRows[0].original
    setCourseNum(selectedCourse.code ?? '')
    setSemester('')
    setClassNum('')
    setRoster([])
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

  const duplicateTarget = async (id: number) => {
    const { data } = await duplicateCourse({
      variables: {
        groupId: id,
        input: {
          classNum: Number(classNum),
          courseNum,
          semester
        }
      }
    })

    const newGroupId = data?.duplicateCourse.duplicatedCourse.id
    if (newGroupId && roster.length > 0) {
      await createWhitelist({
        variables: {
          groupId: Number(newGroupId),
          studentIds: roster.map((row) => row.studentId),
          names: roster.map((row) => row.name || null)
        }
      })
    }
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
      <div className="max-h-[70vh] w-full min-w-0 overflow-y-auto pl-[2px] pr-2">
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
              <label className="text-sm font-medium">Course Code</label>
              <div className="relative w-full">
                <input
                  value={courseNum}
                  onChange={(e) => setCourseNum(e.target.value)}
                  placeholder="Enter course number"
                  maxLength={7}
                  className={`box-border w-full min-w-0 rounded-md border px-3 py-2 pr-12 text-sm ${
                    courseNumError
                      ? 'border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {courseNum.length}/7
                </span>
              </div>
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
              <label className="text-sm font-medium">Course Section</label>
              <div className="relative w-full">
                <input
                  value={classNum}
                  onChange={(e) => setClassNum(e.target.value)}
                  placeholder="Enter class number"
                  maxLength={2}
                  className={`box-border w-full min-w-0 rounded-md border px-3 py-2 pr-12 text-sm ${
                    classNumError
                      ? 'border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500'
                      : 'border-gray-300'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {classNum.length}/2
                </span>
              </div>

              {classNumError && (
                <p className="text-sm text-red-500">{classNumError}</p>
              )}
            </div>

            <div className="flex w-full min-w-0 flex-col gap-2">
              <label className="text-sm font-medium">Students</label>
              <button
                type="button"
                className="flex h-[42px] w-full items-center justify-between rounded-md border border-gray-300 px-3 text-sm"
                onClick={() => setIsRosterModalOpen(true)}
              >
                <span>
                  {roster.length > 0
                    ? `${roster.length} students added`
                    : 'Add student roster'}
                </span>
                {roster.length > 0 && (
                  <span className="text-primary">Edit</span>
                )}
              </button>
              <StudentRosterModal
                rows={roster}
                onSave={setRoster}
                open={isRosterModalOpen}
                onOpenChange={setIsRosterModalOpen}
              />
            </div>
          </div>
        </div>
      </div>
    </AlertModal>
  )
}
