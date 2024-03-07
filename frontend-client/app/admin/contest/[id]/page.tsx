'use client'

import { gql } from '@generated'
import TextEditor from '@/components/TextEditor'
import { DateTimePickerDemo } from '@/components/date-time-picker-demo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { UpdateContestInput } from '@/generated'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { PiWarningBold } from 'react-icons/pi'
import { toast } from 'sonner'
import { z } from 'zod'
import Label from '../_components/Label'

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

export default function Page({ params }: { params: { id: string } }) {
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
      const data = contestData.getContest
      setValue('id', Number(id))
      setValue('title', data.title)
      setValue('description', data.description)
      setValue('startTime', new Date(data.startTime))
      setValue('endTime', new Date(data.endTime))
    }
  })

  const [updateContest, { error }] = useMutation(UPDATE_CONTEST)
  const onSubmit = async (input: UpdateContestInput) => {
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
    toast.success('Contest updated successfully')
    router.push('/admin/contest')
  }

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
