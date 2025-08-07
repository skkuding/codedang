'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { UPDATE_COURSE } from '@/graphql/course/mutation'
import { GET_COURSE } from '@/graphql/course/queries'
import type { SemesterSeason } from '@/types/type'
import { useMutation, useQuery } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { FaPen } from 'react-icons/fa6'
import { toast } from 'sonner'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { useDataTable } from '../../_components/table/context'
import { courseSchema } from '../_libs/schema'

interface UpdateCourseButtonProps {
  onSuccess?: () => void
}

interface TableRowData {
  id: number
  groupName: string
  courseInfo: {
    courseNum: string
    classNum: number
    professor: string
    semester: string
    week: number
    email: string
    website: string
    office: string
    phoneNum: string
  }
}

export function UpdateCourseButton({ onSuccess }: UpdateCourseButtonProps) {
  const [updateCourse] = useMutation(UPDATE_COURSE)
  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    reset,
    formState: { errors, isValid }
  } = useForm<CourseInput>({
    resolver: valibotResolver(courseSchema),
    defaultValues: {
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: false
      }
    }
  })
  const { table } = useDataTable<TableRowData>()
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [prefix, setPrefix] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [semester, setSemester] = useState('')
  const [week, setWeek] = useState(0)
  const currentYear = new Date().getFullYear()
  const seasons: SemesterSeason[] = ['Spring', 'Summer', 'Fall', 'Winter']

  const updateTarget = (id: number, courseInput: CourseInput) => {
    return updateCourse({
      variables: {
        groupId: id,
        input: courseInput
      }
    })
  }

  useEffect(() => {
    setValue('courseNum', `${prefix}${courseCode}`)
  }, [prefix, courseCode, setValue])

  const handleUpdateRow: SubmitHandler<CourseInput> = async (data) => {
    const selectedRow = table.getSelectedRowModel().rows[0]
    const updatePromise = updateTarget(Number(selectedRow.original.id), {
      courseTitle: data.courseTitle,
      courseNum: `${prefix}${courseCode}`,
      classNum: Number(data.classNum),
      professor: data.professor,
      semester: data.semester,
      week: data.week,
      email: data.email,
      website: data.website,
      office: data.office,
      phoneNum: data.phoneNum,
      config: data.config
    })

    try {
      await updatePromise
      table.resetRowSelection()
      table.resetPageIndex()
      onSuccess?.()
      toast.success('Course updated successfully!')
    } catch {
      toast.error(`Failed to update course`)
    }
  }

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setPrefix(value)
  }

  const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setCourseCode(value)
  }

  const { refetch } = useQuery(GET_COURSE, {
    variables: { groupId: 0 },
    skip: true
  })

  const handleUpdateButtonClick = async () => {
    const selectedRow = table.getSelectedRowModel().rows[0]

    if (table.getSelectedRowModel().rows.length !== 1) {
      console.warn('Row selection condition not met')
      return
    }

    const groupId = selectedRow?.original?.id

    if (!groupId) {
      console.error('groupId is undefined')
      return
    }

    try {
      const result = await refetch({ groupId })

      if (result.data) {
        const data = result.data.getCourse

        setPrefix(data.courseInfo?.courseNum.substring(0, 3) ?? '')
        setCourseCode(data.courseInfo?.courseNum.substring(3) ?? '')
        setSemester(data.courseInfo?.semester ?? '')
        setWeek(data.courseInfo?.week ?? 0)
        reset({
          courseTitle: data.groupName,
          courseNum: `${prefix}${courseCode}`,
          classNum: data.courseInfo?.classNum,
          professor: data.courseInfo?.professor,
          semester: data.courseInfo?.semester,
          week: data.courseInfo?.week,
          email: data.courseInfo?.email,
          website: data.courseInfo?.website,
          office: data.courseInfo?.office,
          phoneNum: data.courseInfo?.phoneNum,
          config: {
            showOnList: true,
            allowJoinFromSearch: true,
            allowJoinWithURL: true,
            requireApprovalBeforeJoin: false
          }
        })

        setIsAlertDialogOpen(true)
      }
    } catch (error) {
      console.error('Refetch error:', error)
    }
  }

  return (
    <>
      <Button variant="outline" type="button" onClick={handleUpdateButtonClick}>
        <FaPen fontSize={13} color={'#8A8A8A'} />
      </Button>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent className="px-2 py-0">
          <ScrollArea className="max-h-[700px] px-6 pt-8">
            <AlertDialogHeader className="pb-6">
              <AlertDialogTitle>Update Course</AlertDialogTitle>
            </AlertDialogHeader>

            <form
              onSubmit={handleSubmit(handleUpdateRow)}
              aria-label="Update course"
              className="flex flex-col gap-3"
            >
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="font-bold">Professor</span>
                  <span className="text-red-500">*</span>
                </div>
                <Input id="professor" {...register('professor')} />
                {errors.professor && (
                  <ErrorMessage message={errors.professor.message} />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="font-bold">Course Title</span>
                  <span className="text-red-500">*</span>
                </div>

                <Input id="courseTitle" {...register('courseTitle')} />
                {errors.courseTitle && (
                  <ErrorMessage message={errors.courseTitle.message} />
                )}
              </div>

              <div className="flex justify-between gap-4">
                <div className="flex w-2/3 flex-col gap-2">
                  <div className="flex gap-2">
                    <span className="font-bold">Course Code</span>
                    <span className="text-red-500">*</span>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="SWE"
                      value={prefix}
                      onChange={handlePrefixChange}
                      maxLength={3}
                      className="rounded-xs w-full border p-2"
                    />
                    <Input
                      type="text"
                      placeholder="0000"
                      value={courseCode}
                      onChange={handleCourseCodeChange}
                      maxLength={4}
                      className="rounded-xs w-full border p-2"
                    />
                  </div>
                  {errors.courseNum && (
                    <ErrorMessage message={errors.courseNum.message} />
                  )}
                </div>
                <div className="flex w-1/3 flex-col gap-2">
                  <div className="flex gap-2">
                    <span className="font-bold">Class Section</span>
                  </div>

                  <Input
                    {...register('classNum', {
                      setValueAs: (v) => parseInt(v)
                    })}
                    type="number"
                    maxLength={2}
                    className="rounded-xs w-full border p-2"
                  />
                  {errors.classNum && (
                    <ErrorMessage message={errors.classNum.message} />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="font-bold">Semester</span>
                  <span className="text-red-500">*</span>
                </div>
                <Select
                  onValueChange={(value) => setValue('semester', value)} // 선택값을 form 상태에 저장
                  defaultValue={semester.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                    {seasons.map((season) => (
                      <SelectItem
                        key={`${currentYear} ${season}`}
                        value={`${currentYear} ${season}`}
                      >
                        {currentYear} {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.semester && (
                  <ErrorMessage message={errors.semester.message} />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="font-bold">Week</span>
                  <span className="text-red-500">*</span>
                </div>
                <Select
                  onValueChange={(weekCount) => {
                    const parsedWeekCount = parseInt(weekCount, 10)
                    setValue('week', parsedWeekCount)
                  }}
                  defaultValue={week.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                    {[3, 6, 16].map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        {week} {week === 1 ? 'Week' : 'Weeks'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.week && <ErrorMessage message={errors.week.message} />}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="font-bold">Contact</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-normal">Email</span>
                  <Input
                    {...register('email')}
                    type="email"
                    className="rounded-xs w-full border p-2"
                    // defaultValue=""
                  />
                  {errors.email && (
                    <ErrorMessage message={errors.email.message} />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-normal">Phone Number</span>
                  <Input
                    {...register('phoneNum')}
                    type="text"
                    className="rounded-xs w-full border p-2"
                    // defaultValue=""
                  />
                  {errors.phoneNum && (
                    <ErrorMessage message={errors.phoneNum.message} />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-normal">Office</span>
                  <Input
                    {...register('office')}
                    type="text"
                    className="rounded-xs w-full border p-2"
                    // defaultValue=""
                  />
                  {errors.office && (
                    <ErrorMessage message={errors.office.message} />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-normal">Website</span>
                  <Input
                    {...register('website')}
                    type="text"
                    className="rounded-xs w-full border p-2"
                    // defaultValue=""
                  />
                  {errors.website && (
                    <ErrorMessage message={errors.website.message} />
                  )}
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary-strong"
                    onClick={(event) => {
                      if (!isValid) {
                        event.preventDefault() // AlertDialog 닫힘 방지
                        trigger()
                      }
                    }}
                  >
                    Update
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
