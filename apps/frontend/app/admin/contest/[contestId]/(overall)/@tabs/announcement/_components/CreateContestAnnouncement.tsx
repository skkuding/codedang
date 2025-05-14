'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { announcementSchema } from '@/app/admin/contest/_libs/schemas'
import { Button } from '@/components/shadcn/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { Textarea } from '@/components/shadcn/textarea'
import { CREATE_CONTEST_ANNOUNCEMENT } from '@/graphql/contest/mutations'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { convertToLetter } from '@/libs/utils'
import { useQuery, useMutation } from '@apollo/client'
import type { CreateAnnouncementInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { BiSolidPencil } from 'react-icons/bi'
import { toast } from 'sonner'

export function CreateContestAnnouncement({
  contestId
}: {
  contestId: number
}) {
  const txtMaxLength = 400
  const { data: problemData } = useQuery(GET_CONTEST_PROBLEMS, {
    variables: { contestId }
  })
  const [createAnnouncement] = useMutation(CREATE_CONTEST_ANNOUNCEMENT)

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    resetField,
    formState: { errors }
  } = useForm<CreateAnnouncementInput>({
    resolver: valibotResolver(announcementSchema)
  })

  const txtlength = (watch('content') || '').length
  const onSubmitAnnouncement: SubmitHandler<CreateAnnouncementInput> = async (
    data
  ) => {
    try {
      await createAnnouncement({
        variables: {
          contestId,
          input: {
            content: data.content,
            problemOrder: data.problemOrder
          }
        }
      })
      resetField('content')
      toast.success('Create Announcement successfully!')
    } catch (error) {
      //TODO: error handling
      console.error('Error with creating Announcement:', error)
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitAnnouncement)}>
      <p className="mb-6 text-2xl font-semibold">Post New Announcement</p>
      <div className="mb-[10px]">
        <Select
          onValueChange={(value) => {
            setValue('problemOrder', value === 'none' ? null : Number(value), {
              shouldValidate: true
            })
          }}
        >
          <SelectTrigger className="h-12 rounded-full bg-white pl-[30px] text-xl font-medium text-[#474747] focus:ring-0">
            <SelectValue placeholder="General" />
          </SelectTrigger>
          <SelectContent
            className="rounded-md border border-gray-200 bg-white shadow-md"
            aria-required
          >
            <SelectItem
              value="none"
              className="hover:text-primary text-lg font-normal"
            >
              General
            </SelectItem>
            {problemData?.getContestProblems.map((problem) => (
              <SelectItem
                key={problem.order}
                value={problem.order.toString()}
                className="hover:text-primary text-lg font-normal"
              >
                {convertToLetter(problem.order)}. {problem.problem.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.problemOrder && (
          <ErrorMessage message={errors.problemOrder.message} />
        )}
      </div>
      <div className="relative">
        <Textarea
          {...register('content')}
          placeholder="Enter your announcement"
          maxLength={txtMaxLength}
          className="min-h-[260px] rounded-xl bg-white px-[30px] py-6 text-lg font-normal text-black placeholder:text-[#3333334D] focus-visible:ring-0"
        />
        {errors.content && <ErrorMessage />}
        <p className="absolute bottom-6 right-[28px] text-base font-medium text-[#8A8A8A]">
          {txtlength}/400
        </p>
      </div>
      <p className="mb-20 mt-2 text-base font-normal text-[#9B9B9B]">
        Posted announcement cannot be edited.
      </p>
      <Button type="submit" className="h-12 w-full text-lg font-bold">
        <BiSolidPencil className="white" />
        &nbsp; Post
      </Button>
    </form>
  )
}
