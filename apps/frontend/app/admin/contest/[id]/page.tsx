'use client'

import { gql } from '@generated'
import { DataTableAdmin } from '@/components/DataTableAdmin'
import TextEditor from '@/components/TextEditor'
import { DateTimePickerDemo } from '@/components/date-time-picker-demo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateContestInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { PiWarningBold } from 'react-icons/pi'
import { toast } from 'sonner'
import { z } from 'zod'
import Label from '../_components/Label'
import { columns } from './_components/Columns'

const GET_CONTEST = gql(`
  query GetContest($contestId: Int!) {
    getContest(contestId: $contestId) {
      id
      description
      endTime
      startTime
      title
    }
  }
`)

const UPDATE_CONTEST = gql(`
  mutation UpdateContest($groupId: Int!, $input: UpdateContestInput!) {
    updateContest(groupId: $groupId, input: $input) {
      id
      config
      description
      endTime
      startTime
      title
    }
  }
`)

const GET_CONTEST_PROBLEMS = gql(`
  query GetContestProblems($groupId: Int!, $contestId: Int!) {
    getContestProblems(groupId: $groupId, contestId: $contestId) {
      order
      problemId
      problem {
        title
        difficulty
		  }
    }
  }
`)

const IMPORT_PROBLEMS_TO_CONTEST = gql(`
  mutation ImportProblemsToContest(
    $groupId: Int!,
    $contestId: Int!,
    $problemIds: [Int!]!
  ) {
    importProblemsToContest(
      groupId: $groupId,
      contestId: $contestId,
      problemIds: $problemIds
    ) {
      contestId
      problemId
    }
  }
`)

const REMOVE_PROBLEMS_FROM_CONTEST = gql(`
  mutation RemoveProblemsFromContest(
    $groupId: Int!,
    $contestId: Int!,
    $problemIds: [Int!]!
  ) {
    removeProblemsFromContest(
      groupId: $groupId,
      contestId: $contestId,
      problemIds: $problemIds
    ) {
      contestId
      problemId
    }
  }
`)

const UPDATE_CONTEST_PROBLEMS_ORDER = gql(`
  mutation UpdateContestProblemsOrder($groupId: Int!, $contestId: Int!, $orders: [Int!]!) {
    updateContestProblemsOrder(groupId: $groupId, contestId: $contestId, orders: $orders) {
      order
      contestId
      problemId
    }
  }
`)

const inputStyle =
  'border-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950'

const schema = z.object({
  id: z.number(),
  title: z.string().min(1).max(100),
  config: z.object({
    isRankVisible: z.boolean(),
    isVisible: z.boolean()
  }),
  description: z.string().min(1),
  startTime: z.date(),
  endTime: z.date()
})

interface Problem {
  id: number
  title: string
  order: number
  difficulty: string
}

export default function Page({ params }: { params: { id: string } }) {
  const [prevProblemIds, setPrevProblemIds] = useState<number[]>([])
  const [problems, setProblems] = useState<Problem[]>([])
  const { id } = params

  const router = useRouter()

  const {
    handleSubmit,
    control,
    register,
    getValues,
    setValue,
    formState: { errors }
  } = useForm<UpdateContestInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      config: {
        isRankVisible: true,
        isVisible: true
      }
    }
  })

  useQuery(GET_CONTEST, {
    variables: { contestId: Number(id) },
    onCompleted: (contestData) => {
      const storedContestFormData = localStorage.getItem(
        `contestFormData-${id}`
      )
      setValue('id', Number(id))
      if (storedContestFormData) {
        const contestFormData = JSON.parse(storedContestFormData)
        setValue('title', contestFormData.title)
        if (contestFormData.startTime) {
          setValue('startTime', new Date(contestFormData.startTime))
        }
        if (contestFormData.endTime) {
          setValue('endTime', new Date(contestFormData.endTime))
        }
        setValue('description', contestFormData.description)
      } else {
        const data = contestData.getContest
        setValue('title', data.title)
        setValue('description', data.description)
        setValue('startTime', new Date(data.startTime))
        setValue('endTime', new Date(data.endTime))
      }
    }
  })

  useQuery(GET_CONTEST_PROBLEMS, {
    variables: { groupId: 1, contestId: Number(id) },
    onCompleted: (problemData) => {
      const data = problemData.getContestProblems

      setPrevProblemIds(data.map((problem) => problem.problemId))
      const importedProblems = localStorage.getItem(`importProblems-${id}`)

      if (importedProblems === null) {
        const contestProblems = data.map((problem) => {
          return {
            id: problem.problemId,
            title: problem.problem.title,
            order: problem.order,
            difficulty: problem.problem.difficulty
          }
        })
        localStorage.setItem(
          'orderArray',
          JSON.stringify(data.map((problem) => problem.order))
        )
        localStorage.setItem(
          `importProblems-${id}`,
          JSON.stringify(contestProblems)
        )
        setProblems(contestProblems)
      } else {
        const parsedData = JSON.parse(importedProblems)
        if (parsedData.length > 0) {
          setProblems(parsedData)
          const orderArray = parsedData.map(
            // eslint-disable-next-line
            (_: any, index: number) => index
          )
          localStorage.setItem('orderArray', JSON.stringify(orderArray))
        }
      }
    }
  })

  const [updateContest, { error }] = useMutation(UPDATE_CONTEST)
  const [importProblemsToContest] = useMutation(IMPORT_PROBLEMS_TO_CONTEST)
  const [removeProblemsFromContest] = useMutation(REMOVE_PROBLEMS_FROM_CONTEST)
  const [updateContestProblemsOrder] = useMutation(
    UPDATE_CONTEST_PROBLEMS_ORDER
  )

  const onSubmit = async (input: UpdateContestInput) => {
    if (input.startTime >= input.endTime) {
      toast.error('Start time must be less than end time')
      return
    }

    const problemIds = problems.map((problem) => problem.id)

    // TODO: connect romoveproblem API
    const removedProblems = prevProblemIds.filter(
      (id) => !problemIds.includes(id)
    )
    const addedProblems = problemIds.filter(
      (id) => !prevProblemIds.includes(id)
    )

    const orderArray = JSON.parse(localStorage.getItem('orderArray') || '[]')
    if (orderArray.length === 0) {
      toast.error('Problem order not set')
      return
    }
    if (orderArray.length !== problemIds.length) {
      toast.error('Problem order not set')
      return
    }
    orderArray.forEach((order: number) => {
      if (order === null) {
        toast.error('Problem order not set')
        return
      }
    })
    if (new Set(orderArray).size !== orderArray.length) {
      toast.error('Duplicate problem order found')
      return
    }

    await updateContest({
      variables: {
        groupId: 1,
        input
      }
    })
    if (error) {
      toast.error('Failed to update contest')
      return
    }

    if (addedProblems.length !== 0) {
      await importProblemsToContest({
        variables: {
          groupId: 1,
          contestId: Number(id),
          problemIds: addedProblems
        }
      })
    }
    if (removedProblems.length !== 0) {
      await removeProblemsFromContest({
        variables: {
          groupId: 1,
          contestId: Number(id),
          problemIds: removedProblems
        }
      })
    }

    const orders: number[] = []
    orderArray.forEach((order: number, index: number) => {
      orders[order] = problemIds[index]
    })
    await updateContestProblemsOrder({
      variables: {
        groupId: 1,
        contestId: Number(id),
        orders
      }
    })
    localStorage.removeItem('orderArray')
    localStorage.removeItem(`contestFormData-${id}`)
    localStorage.removeItem('orderArray')
    toast.success('Contest updated successfully')
    router.push('/admin/contest')
  }

  return (
    <ScrollArea className="w-full">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center gap-4">
          <Link href="/admin/contest">
            <FaAngleLeft className="h-12" />
          </Link>
          <span className="text-4xl font-bold">Edit Contest</span>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex w-[760px] flex-col gap-6"
        >
          <div className="flex gap-6">
            <div className="flex flex-col gap-1">
              <Label>Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Name your contest"
                className={cn(inputStyle, 'w-[380px]')}
                {...register('title')}
              />
              {errors.title && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <PiWarningBold />
                  {getValues('title').length === 0
                    ? 'required'
                    : errors.title?.message}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <Label>Start Time</Label>
              <Controller
                render={({ field }) => (
                  <DateTimePickerDemo
                    onChange={field.onChange}
                    defaultValue={field.value}
                  />
                )}
                name="startTime"
                control={control}
              />
              {errors.startTime && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <PiWarningBold />
                  {errors.startTime?.message as string}
                </div>
              )}
            </div>
            <div>
              <Label>End Time</Label>
              <Controller
                render={({ field }) => (
                  <DateTimePickerDemo
                    onChange={field.onChange}
                    defaultValue={field.value}
                  />
                )}
                name="endTime"
                control={control}
              />
              {errors.endTime && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <PiWarningBold />
                  {errors.endTime?.message as string}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Description</Label>
            {getValues('description') && (
              <Controller
                render={({ field }) => (
                  <TextEditor
                    placeholder="Enter a description..."
                    onChange={field.onChange}
                    defaultValue={field.value}
                  />
                )}
                name="description"
                control={control}
              />
            )}
            {errors.description && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <PiWarningBold />
                required
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <Label>Contest Problem List</Label>
              <Button
                type="button"
                className="flex h-[36px] w-36 items-center gap-2 px-0"
                onClick={() => {
                  const formData = {
                    title: getValues('title'),
                    startTime: getValues('startTime'),
                    endTime: getValues('endTime'),
                    description: getValues('description')
                  }
                  localStorage.setItem(
                    `contestFormData-${id}`,
                    JSON.stringify(formData)
                  )
                  router.push(`/admin/problem?import=true&contestId=${id}`)
                }}
              >
                <PlusCircleIcon className="h-4 w-4" />
                <div className="mb-[2px] text-sm">Import Problem</div>
              </Button>
            </div>
            <DataTableAdmin
              // eslint-disable-next-line
              columns={columns as any[]}
              data={problems as Problem[]}
              enableDelete={true}
              enableSearch={true}
            />
          </div>

          <Button
            type="submit"
            className="flex h-[36px] w-[100px] items-center gap-2 px-0"
          >
            <IoMdCheckmarkCircleOutline fontSize={20} />
            <div className="mb-[2px] text-base">Submit</div>
          </Button>
        </form>
      </main>
    </ScrollArea>
  )
}
