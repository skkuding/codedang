'use client'

import { gql } from '@generated'
import { DataTableAdmin } from '@/components/DataTableAdmin'
import TextEditor from '@/components/TextEditor'
import { DateTimePickerDemo } from '@/components/date-time-picker-demo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { CreateContestInput } from '@/generated'
import { cn } from '@/lib/utils'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { MdHelpOutline } from 'react-icons/md'
import { PiWarningBold } from 'react-icons/pi'
import { toast } from 'sonner'
import { z } from 'zod'
import Label from '../_components/Label'
import { columns } from './_components/Columns'

const CREATE_CONTEST = gql(`
  mutation CreateContest($groupId: Int!, $input: CreateContestInput!) {
    createContest(groupId: $groupId, input: $input) {
      id
      config
      description
      endTime
      startTime
      title
    }
  }
`)

const CREATE_PROBLEM = gql(`
  mutation CreateProblem($groupId: Int!, $input: CreateProblemInput!) {
    createProblem(groupId: $groupId, input: $input) {
      id
      createdById
      groupId
      title
      isVisible
      difficulty
      languages
      problemTag {
        tagId
      }
      description
      inputDescription
      outputDescription
      samples {
        input
        output
      }
      problemTestcase {
        input
        output
      }
      timeLimit
      memoryLimit
      hint
      source
      template
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
  title: z.string().min(1).max(100),
  config: z.object({
    isRankVisible: z.boolean().optional(),
    isVisible: z.boolean().optional()
  }),
  description: z.string().min(1),
  startTime: z.date(),
  endTime: z.date()
})

export default function Page() {
  const [problems, setProblems] = useState([])

  const router = useRouter()

  const {
    handleSubmit,
    control,
    register,
    getValues,
    setValue,
    formState: { errors }
  } = useForm<CreateContestInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      config: {
        isRankVisible: true,
        isVisible: true
      }
    }
  })

  const [createProblem, { problemError }] = useMutation(CREATE_PROBLEM)
  const [createContest, { contestError }] = useMutation(CREATE_CONTEST)
  const [importProblemsToContest, { importError }] = useMutation(
    IMPORT_PROBLEMS_TO_CONTEST
  )
  const [updateContestProblemsOrder] = useMutation(
    UPDATE_CONTEST_PROBLEMS_ORDER
  )
  const onSubmit = async (input: CreateContestInput) => {
    const problemIds = []
    const storedData = localStorage.getItem('orderArray')
    if (!storedData) {
      toast.error('Problem order not set')
      return
    }
    const orders = JSON.parse(storedData)
    if (new Set(orders).size !== orders.length) {
      toast.error('Duplicate problem order found')
      return
    }
    const { data } = await createContest({
      variables: {
        groupId: 1,
        input
      }
    })
    const contestId = Number(data.createContest.id)
    if (contestError) {
      toast.error('Failed to create contest')
      return
    }
    const createProblemPromise = problems.map(async (problem) => {
      const { data } = await createProblem({
        variables: {
          groupId: 1,
          input: problem
        }
      })
      problemIds.push(Number(data.createProblem.id))
      if (problemError) {
        toast.error('Failed to create problem')
        return
      }
    })
    await Promise.all(createProblemPromise)
    await importProblemsToContest({
      variables: {
        groupId: 1,
        contestId,
        problemIds
      }
    })
    if (importError) {
      toast.error('Failed to create contest')
      return
    }
    await updateContestProblemsOrder({
      variables: {
        groupId: 1,
        contestId,
        orders
      }
    })
    localStorage.removeItem('contestFormData')
    localStorage.removeItem('problemFormDatas')
    localStorage.removeItem('orderArray')
    toast.success('Contest created successfully')
    router.push('/admin/contest')
  }

  useEffect(() => {
    const storedData = localStorage.getItem('contestFormData')
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setValue('title', parsedData.title)
      if (parsedData.startTime) {
        setValue('startTime', new Date(parsedData.startTime))
      }
      if (parsedData.endTime) {
        setValue('endTime', new Date(parsedData.endTime))
      }
      setValue('description', parsedData.description)
    } else {
      setValue('description', ' ')
    }
    setProblems(JSON.parse(localStorage.getItem('problemFormDatas')) || [])
  }, [])

  return (
    <ScrollArea className="w-full">
      <main className="flex flex-col gap-6 px-20 py-16">
        <div className="flex items-center gap-4">
          <FaAngleLeft className="h-12" />
          <span className="text-4xl font-bold">Create Contest</span>
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
                    : errors.title.message}
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
                  {errors.startTime.message}
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
                  {errors.endTime.message}
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
              <div className="flex items-center gap-2">
                <Label>Contest Problem List</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button>
                      <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="top"
                    className="mb-2 w-[680px] bg-black px-4 py-2 text-white"
                  >
                    <ul className="text-xs font-normal">
                      <li>
                        The problems in the contest problem list are initially
                        set to &apos;not visible&apos; at the time of creating
                        the contest
                      </li>
                      <li>
                        They become visible according to the specified start
                        time and remain inaccessible in the problem list
                      </li>
                      <li>
                        throughout the duration of the contest. After the
                        contest period ends, they become visible again in the
                        problem list.
                      </li>
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
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
                    'contestFormData',
                    JSON.stringify(formData)
                  )
                  router.push('/admin/problem/create?iscontest=1')
                }}
              >
                <PlusCircleIcon className="h-4 w-4" />
                <div className="mb-[2px] text-sm">Create Problem</div>
              </Button>
            </div>
            <DataTableAdmin columns={columns} data={problems} />
          </div>
          <Button
            type="submit"
            className="flex h-[36px] w-[100px] items-center gap-2 px-0 "
          >
            <IoMdCheckmarkCircleOutline fontSize={20} />
            <div className="mb-[2px] text-base">Create</div>
          </Button>
        </form>
      </main>
    </ScrollArea>
  )
}
