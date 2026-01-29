'use client'

import { getAssignments } from '@/app/(client)/_libs/apis/assignment'
import { getAssignmentProblemList } from '@/app/(client)/_libs/apis/assignmentProblem'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/shadcn/select'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import arrowLeftIcon from '@/public/icons/arrow-left-black.svg'
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'
import { IoPencil } from 'react-icons/io5'
import { toast } from 'sonner'

interface CreateQnaInput {
  category: string
  problemId: number
  title: string
  content: string
  isPrivate: boolean
}

export default function Page() {
  const router = useRouter()
  const { courseId } = useParams()
  const [currentAssignmentId, setCurrentAssignmentId] = useState<number | null>(
    null
  )

  const methods = useForm<CreateQnaInput>({
    defaultValues: {
      category: 'GENERAL',
      problemId: 0,
      title: '',
      content: '',
      isPrivate: false
    }
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting }
  } = methods

  const categoryValue = watch('category')
  const problemIdValue = watch('problemId')

  const handleCategoryChange = (val: string) => {
    setValue('category', val)
    setCurrentAssignmentId(null)
    setValue('problemId', 0)
  }

  const handleAssignmentChange = (val: string) => {
    const id = Number(val)
    setCurrentAssignmentId(id)
    setValue('problemId', 0) // 과제 변경 시 문제 초기화
  }

  const handleProblemChange = (val: string) => {
    setValue('problemId', Number(val))
  }

  const results = useSuspenseQueries({
    queries: [
      {
        queryKey: ['assignments', courseId, false],
        queryFn: () =>
          getAssignments({ courseId: Number(courseId), isExercise: false })
      },
      {
        queryKey: ['assignments', courseId, true],
        queryFn: () =>
          getAssignments({ courseId: Number(courseId), isExercise: true })
      }
    ]
  })

  const allTasks = useMemo(() => {
    const [as, ex] = results.map((r) => r.data || [])
    return [...as, ...ex].sort((a, b) => (a.week || 0) - (b.week || 0))
  }, [results])

  const { data: problems } = useSuspenseQuery({
    queryKey: ['assignmentProblems', currentAssignmentId],
    queryFn: async () => {
      if (!currentAssignmentId) {
        return { data: [] }
      }
      return await getAssignmentProblemList({
        assignmentId: currentAssignmentId,
        groupId: Number(courseId)
      })
    }
  })

  const contentValue = watch('content') || ''

  const onSubmit = async (data: CreateQnaInput) => {
    try {
      const payload = {
        title: data.title,
        content: data.content,
        isPrivate: data.isPrivate
      }

      const hasProblem = data.problemId && data.problemId !== 0
      const apiUrl = `course/${courseId}/qna${hasProblem ? `?problemId=${data.problemId}` : ''}`

      await safeFetcherWithAuth.post(apiUrl, { json: payload }).json()

      toast.success('Question posted successfully!')
      router.push(`/course/${courseId}/qna`)
      router.refresh()
    } catch (error) {
      console.error('Failed to post question:', error)
      toast.error('Failed to post question. Please try again.')
    }
  }

  return (
    <div className="mx-[116px] mt-20 flex flex-col gap-6">
      <div className="flex items-center gap-[10px]">
        <Link href={`/course/${courseId}/qna` as const}>
          <Image
            src={arrowLeftIcon}
            alt="arrow left icon"
            className="h-6 w-6"
          />
        </Link>
        <span className="text-2xl font-medium leading-[28.8px] tracking-[-0.72px]">
          Post New Question
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormProvider {...methods}>
          <div className="flex items-center gap-4 rounded-full border border-gray-200 bg-white p-4">
            <div className="flex flex-1 items-center">
              <Select
                value={categoryValue}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="h-4 border-none bg-white px-2 text-[15px] font-normal text-gray-500 focus:ring-0 focus:ring-offset-0">
                  <span className="flex-1 text-left">Category</span>
                </SelectTrigger>
                <SelectContent className="mt-2 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
                  <SelectItem
                    value="General"
                    className="rounded-xl py-2.5 text-[14px] hover:bg-gray-100"
                  >
                    General
                  </SelectItem>
                  <SelectItem
                    value="Problem"
                    className="rounded-xl py-2.5 text-[14px] hover:bg-gray-100"
                  >
                    Problem
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {categoryValue === 'Problem' && (
              <>
                <div className="h-5 w-[1px] bg-gray-200" />

                <div className="flex flex-1 items-center">
                  <Select
                    value={currentAssignmentId?.toString() || ''}
                    onValueChange={handleAssignmentChange}
                  >
                    <SelectTrigger className="h-4 border-none bg-white px-2 text-[15px] font-normal text-gray-500 focus:ring-0 focus:ring-offset-0">
                      <span className="flex-1 text-left">Task</span>
                    </SelectTrigger>
                    <SelectContent className="mt-2 max-h-[250px] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
                      {allTasks?.map((task) => (
                        <SelectItem
                          key={task.id}
                          value={task.id.toString()}
                          className="rounded-xl py-2.5 text-[14px] hover:bg-gray-100"
                        >
                          <span className="font-medium">
                            [{task.week ? `Week${task.week}` : 'Week'}]
                            {task.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-5 w-[1px] bg-gray-200" />

                <div className="flex flex-1 items-center">
                  <Select
                    value={problemIdValue?.toString() || '0'}
                    onValueChange={handleProblemChange}
                    disabled={!currentAssignmentId}
                  >
                    <SelectTrigger className="h-4 border-none bg-white px-2 text-[15px] font-normal text-gray-500 focus:ring-0 focus:ring-offset-0 disabled:opacity-30">
                      <span className="flex-1 text-left">Problem</span>
                    </SelectTrigger>
                    <SelectContent className="mt-2 max-h-[250px] rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl">
                      {problems?.data?.map((problem) => (
                        <SelectItem
                          key={problem.id}
                          value={problem.id.toString()}
                          className="rounded-xl py-2.5 text-[14px] hover:bg-gray-100"
                        >
                          {problem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <input
            {...register('title', { required: true })}
            placeholder="Enter a question title"
            className="w-full rounded-full border border-gray-200 p-4 outline-none transition-colors focus:border-blue-500"
          />

          <div className="relative flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors focus-within:border-blue-500">
            <textarea
              {...register('content', { required: true })}
              placeholder="Enter Your Question Details"
              rows={12}
              maxLength={1000}
              className="w-full resize-none bg-transparent leading-relaxed outline-none"
            />
            <span className="px-6 text-right text-sm text-gray-400">
              {contentValue.length}/1000
            </span>

            <div className="mt-4 flex items-center justify-between pt-4">
              <label className="text-primary flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  {...register('isPrivate')}
                  className="h-4 w-4 rounded border-gray-300 accent-[#5B7FFF]"
                />
                Hide from other Students
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 font-semibold text-white transition-all',
              isSubmitting
                ? 'bg-gray-300'
                : 'bg-primary shadow-lg shadow-blue-100 hover:bg-[#4A6EEF]'
            )}
          >
            <IoPencil className="text-lg" />
            <span>Post</span>
          </button>
        </FormProvider>
      </form>
    </div>
  )
}
