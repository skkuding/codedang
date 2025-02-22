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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { CREATE_COURSE } from '@/graphql/course/mutation'
import { useMutation } from '@apollo/client'
import type { CourseInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { FiPlusCircle } from 'react-icons/fi'
import { toast } from 'sonner'
import { courseSchema } from '../_libs/schema'

interface CreateCourseButtonProps<TData extends { id: number }, TPromise> {
  onSuccess?: () => void
}

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
export function CreateCourseButton<TData extends { id: number }, TPromise>({
  onSuccess
}: CreateCourseButtonProps<TData, TPromise>) {
  const { handleSubmit, register, setValue } = useForm<CourseInput>({
    resolver: valibotResolver(courseSchema)
  })
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)
  const [prefix, setPrefix] = useState('')
  const [courseCode, setCourseCode] = useState('')
  const [classNum, setClassNum] = useState('')
  const [createCourse] = useMutation(CREATE_COURSE)

  const onSubmit: SubmitHandler<CourseInput> = async (data) => {
    try {
      const { data: response, errors } = await createCourse({
        variables: {
          input: {
            courseTitle: data.courseTitle,
            courseNum: `${prefix}${courseCode}`,
            classNum: parseInt(classNum, 10),
            professor: data.professor,
            semester: data.semester,
            week: data.week,
            email: data.email,
            website: data.website,
            office: data.office,
            phoneNum: data.phoneNum,
            config: {
              showOnList: true,
              allowJoinFromSearch: true,
              allowJoinWithURL: true,
              requireApprovalBeforeJoin: false
            }
          }
        }
      })

      if (errors) {
        console.error('GraphQL Errors:', errors)
        toast.error('Failed to create course')
        return
      }

      toast.success('Course created successfully!')
      setIsAlertDialogOpen(false)
    } catch (error) {
      console.error('Error creating course:', error)
      toast.error('An unexpected error occurred')
    }
  }

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase() // 대문자로 변환
    if (/^[A-Za-z]{0,3}$/.test(value)) {
      setPrefix(value)
    }
  }

  const handleCourseCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 남기기
    if (/^\d{0,4}$/.test(value)) {
      setCourseCode(value)
    }
  }

  const handleClassNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 남기기
    if (/^\d{0,4}$/.test(value)) {
      setClassNum(value)
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsAlertDialogOpen(true)}
        className="flex gap-2"
      >
        <FiPlusCircle />
        Create
      </Button>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent className="p-8">
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle>Create Course</AlertDialogTitle>
          </AlertDialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            aria-label="Create course"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <span className="font-bold">Professor</span>
                <span className="text-red-500">*</span>
              </div>
              <Input id="profName" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <span className="font-bold">Course Title</span>
                <span className="text-red-500">*</span>
              </div>

              <Input id="courseTitle" />
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
              </div>
              <div className="flex w-1/3 flex-col gap-2">
                <div className="flex gap-2">
                  <span className="font-bold">Class Section</span>
                </div>

                <Input
                  {...register('classNum')}
                  type="text"
                  onChange={handleClassNumChange}
                  maxLength={2}
                  className="w-full rounded border p-2"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <span className="font-bold">Semester</span>
                <span className="text-red-500">*</span>
              </div>
              <Select
                onValueChange={(value) => setValue('semester', value)} // 선택값을 form 상태에 저장
                // value={selectedSemester} // 현재 선택된 값
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                  <SelectItem value="2025-spring">2025 Spring</SelectItem>
                  <SelectItem value="2024-winter">2024 Winter</SelectItem>
                  <SelectItem value="2024-fall">2024 Fall</SelectItem>
                  <SelectItem value="2024-summer">2024 Summer</SelectItem>
                  <SelectItem value="2024-spring">2024 Spring</SelectItem>
                </SelectContent>
              </Select>
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
                  {Array.from({ length: 16 }, (_, i) => {
                    const week = i + 1
                    return (
                      <SelectItem key={week} value={week.toString()}>
                        {week} {week === 1 ? 'Week' : 'Weeks'}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
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
                  className="w-full rounded border p-2"
                  defaultValue={''}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-normal">Phone Number</span>
                <Input
                  {...register('phoneNum')}
                  type="tel"
                  className="w-full rounded border p-2"
                  defaultValue={''}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-normal">Office</span>
                <Input
                  {...register('office')}
                  type="tel"
                  className="w-full rounded border p-2"
                  defaultValue={''}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-normal">Website</span>
                <Input
                  {...register('website')}
                  type="text"
                  className="w-full rounded border p-2"
                  defaultValue={''}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-strong"
                >
                  Create
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
