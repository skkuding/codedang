'use client'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction
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
import { CREATE_COURSE } from '@/graphql/course/mutation'
import { GET_COURSES_USER_LEAD } from '@/graphql/course/queries'
import type { SemesterSeason } from '@/types/type'
import { useApolloClient, useMutation } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { FiX } from 'react-icons/fi'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { toast } from 'sonner'
import { ErrorMessage } from '../../_components/ErrorMessage'
import { courseSchema } from '../_libs/schema'

/**
 * 어드민 테이블의 삭제 버튼 컴포넌트
 * @desctiption 선택된 행들을 삭제하는 기능
 * @param target
 * 삭제 대상 (problem or contest)
 * @param deleteTarget
 * 아이디를 전달받아 삭제 요청하는 함수
 * @param getCanDelete
 * 선택된 행들이 삭제 가능한지를 반환하는 함수
 * @param onSuccess
 * 삭제 성공 시 호출되는 함수
 * @param className
 * tailwind 클래스명
 */
export function CreateCourseButton() {
  const {
    handleSubmit,
    register,
    setValue,
    trigger,
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
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [prefix, setPrefix] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [createCourse] = useMutation(CREATE_COURSE)
  const currentYear = new Date().getFullYear()
  const seasons: SemesterSeason[] = ['Spring', 'Summer', 'Fall', 'Winter']

  const client = useApolloClient()

  const onSubmit: SubmitHandler<CourseInput> = async (data) => {
    try {
      await createCourse({
        variables: {
          input: {
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
          }
        }
      })

      toast.success('Course created successfully!')
      client.refetchQueries({
        include: [GET_COURSES_USER_LEAD]
      })
    } catch (error) {
      //TODO: error handling
      console.error('Error creating course:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase() // 대문자로 변환
    setPrefix(value)
    setValue('courseNum', prefix + courseCode)
  }

  const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 남기기
    setCourseCode(value)
    setValue('courseNum', prefix + courseCode)
  }

  return (
    <>
      <Button
        type="button"
        variant="default"
        onClick={() => setIsAlertDialogOpen(true)}
        className="w-[120px]"
      >
        <HiMiniPlusCircle className="mr-2 h-5 w-5" />
        Create
      </Button>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent className="px-2 py-0">
          <ScrollArea className="max-h-[700px] px-6 pt-8">
            <AlertDialogHeader className="pb-6">
              <AlertDialogTitle>Create Course</AlertDialogTitle>
              <AlertDialogCancel className="absolute right-4 top-4 border-none">
                <FiX className="h-5 w-5" />
              </AlertDialogCancel>
            </AlertDialogHeader>

            <form
              onSubmit={handleSubmit(onSubmit)}
              aria-label="Create course"
              className="flex flex-col gap-3 [&>*]:px-1"
            >
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="font-bold">Professor</span>
                  <span className="text-red-500">*</span>
                </div>
                <Input
                  id="professor"
                  className="w-full rounded border p-2"
                  {...register('professor')}
                />
                {errors.professor && <ErrorMessage />}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="font-bold">Course Title</span>
                  <span className="text-red-500">*</span>
                </div>

                <Input
                  id="courseTitle"
                  className="w-full rounded border p-2"
                  {...register('courseTitle')}
                />
                {errors.courseTitle && <ErrorMessage />}
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
                      className="w-full rounded border p-2"
                    />
                    <Input
                      type="text"
                      placeholder="0000"
                      value={courseCode}
                      onChange={handleCourseCodeChange}
                      maxLength={4}
                      className="w-full rounded border p-2"
                    />
                  </div>
                  {errors.courseNum && <ErrorMessage />}
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
                    className="w-full rounded border p-2"
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
                  onValueChange={(value) => {
                    setValue('semester', value)
                  }}
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
                    type="emailemail"
                    className="w-full rounded border p-2"
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
                    className="w-full rounded border p-2"
                  />
                  {errors.phoneNum && <ErrorMessage />}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-normal">Office</span>
                  <Input
                    {...register('office')}
                    type="text"
                    className="w-full rounded border p-2"
                  />
                  {errors.office && <ErrorMessage />}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-normal">Website</span>
                  <Input
                    {...register('website')}
                    type="text"
                    className="w-full rounded border p-2"
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
                    Create
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
            <div className="h-8" />
          </ScrollArea>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
