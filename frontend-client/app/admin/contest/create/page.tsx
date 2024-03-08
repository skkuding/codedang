'use client'

import { gql } from '@generated'
import TextEditor from '@/components/TextEditor'
import { DateTimePickerDemo } from '@/components/date-time-picker-demo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { CreateContestInput } from '@/generated'
import { cn } from '@/lib/utils'
import { useMutation } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { PiWarningBold } from 'react-icons/pi'
import { toast } from 'sonner'
import { z } from 'zod'
import Label from '../_components/Label'

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
  const router = useRouter()

  const {
    handleSubmit,
    control,
    register,
    getValues,
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

  const [createContest, { error }] = useMutation(CREATE_CONTEST)
  const onSubmit = async (input: CreateContestInput) => {
    const { data } = await createContest({
      variables: {
        groupId: 1,
        input
      }
    })
    const contestId = data.createContest.id
    if (error) {
      toast.error('Failed to create contest')
      return
    }
    toast.success('Contest created successfully')
    router.push(`/admin/problem/create?contestId=${contestId}`)
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
                  <DateTimePickerDemo onChange={field.onChange} />
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
                  <DateTimePickerDemo onChange={field.onChange} />
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
            <Controller
              render={({ field }) => (
                <TextEditor
                  placeholder="Enter a description..."
                  onChange={field.onChange}
                />
              )}
              name="description"
              control={control}
            />
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
            <div className="mb-[2px] text-base">Create Problem</div>
          </Button>
        </form>
      </main>
    </ScrollArea>
  )
}
