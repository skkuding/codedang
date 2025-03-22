'use client'

import { announcementSchema } from '@/app/admin/contest/_libs/schemas'
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
import { Textarea } from '@/components/shadcn/textarea'
import { CREATE_CONTEST_ANNOUNCEMENT } from '@/graphql/contest/mutations'
import { GET_CONTEST_UPDATE_HISTORIES } from '@/graphql/contest/queries'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { convertToLetter, dateFormatter } from '@/libs/utils'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import type { CreateAnnouncementInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { number } from 'valibot'
import { ConfirmNavigation } from '../../../../../_components/ConfirmNavigation'
import { ErrorMessage } from '../../../../../_components/ErrorMessage'

export default function Page() {
  const pathname = usePathname()
  const pathArr = pathname.split('/')
  const contestId = Number(pathArr[pathArr.length - 2])
  const client = useApolloClient()
  const [announcetext, setAnnouncetext] = useState<string>('')
  const { data: problemData } = useQuery(GET_CONTEST_PROBLEMS, {
    variables: { contestId: contestId }
  })
  const { data: updateHistory } = useQuery(GET_CONTEST_UPDATE_HISTORIES, {
    variables: { contestId: contestId }
  })
  console.log('problemData:', problemData)
  const [createAnnouncement] = useMutation(CREATE_CONTEST_ANNOUNCEMENT)
  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    resetField,
    formState: { errors, isValid }
  } = useForm<CreateAnnouncementInput>({
    resolver: valibotResolver(announcementSchema)
  })

  const onSubmitAnnouncement: SubmitHandler<CreateAnnouncementInput> = async (
    data
  ) => {
    try {
      await createAnnouncement({
        variables: {
          input: {
            contestId: contestId,
            problemOrder: data.problemOrder,
            content: data.content
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
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-20 py-16">
          <div>Update History</div>
          <div className="w-full border">
            {!updateHistory?.getContestUpdateHistories ||
              (updateHistory.getContestUpdateHistories.updateHistories
                .length === 0 && <p>no result.</p>)}
            {updateHistory?.getContestUpdateHistories.updateHistories.map(
              (history) => (
                <div key={history.updatedAt}>
                  <div className="flex">
                    <p>
                      Problem{' '}
                      {history.order !== null
                        ? convertToLetter(Number(history.order))
                        : ''}
                      {' : '}
                    </p>
                    <p> </p>
                    <div className="flex">
                      {history.updatedInfo.map((current, index) => (
                        <p key={current.updatedField}>
                          {current.current}
                          {index < history.updatedInfo.length - 1 && ' & '}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          <form onSubmit={handleSubmit(onSubmitAnnouncement)}>
            <p>Post New Announcement</p>
            <div className="flex flex-col gap-2">
              <Select
                onValueChange={(value) => {
                  trigger()
                  setValue(
                    'problemOrder',
                    value === 'none' ? null : Number(value),
                    { shouldValidate: true }
                  )
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-md border border-gray-200 bg-white shadow-md"
                  aria-required
                >
                  <SelectItem value="none">General</SelectItem>
                  {problemData?.getContestProblems.map((problem) => (
                    <SelectItem
                      key={problem.problemId}
                      value={problem.order.toString()}
                    >
                      {problem.order}. {problem.problem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.problemOrder && (
                <ErrorMessage message={errors.problemOrder.message} />
              )}
            </div>
            <div>
              <Textarea
                {...register('content')}
                placeholder="Enter your announcement"
                className="resize-none border-0 px-4 py-0 text-black placeholder:text-[#3333334D] focus-visible:ring-0"
              />
              {errors.content && <ErrorMessage />}
            </div>
            <Button type="submit">Submit</Button>
            <p>Posted announcement cannot be edited.</p>
          </form>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
