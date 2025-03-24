'use client'

import { announcementSchema } from '@/app/admin/contest/_libs/schemas'
import { Button } from '@/components/shadcn/button'
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
import { cn, convertToLetter, dateFormatter } from '@/libs/utils'
import { useMutation, useQuery } from '@apollo/client'
import type { CreateAnnouncementInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { BiSolidPencil } from 'react-icons/bi'
import { toast } from 'sonner'
import { ConfirmNavigation } from '../../../../../_components/ConfirmNavigation'
import { ErrorMessage } from '../../../../../_components/ErrorMessage'

export default function Page() {
  const pathname = usePathname()
  const pathArr = pathname.split('/')
  const contestId = Number(pathArr[pathArr.length - 2])

  const [openHistory, setOpenHistory] = useState<boolean>(false)
  const [seemore, setSeemore] = useState<string>('see more')
  const [seemoreHeight, setSeemoreHeight] = useState<string>('149px')
  const { data: problemData } = useQuery(GET_CONTEST_PROBLEMS, {
    variables: { contestId }
  })
  const { data: updateHistory } = useQuery(GET_CONTEST_UPDATE_HISTORIES, {
    variables: { contestId }
  })
  const [createAnnouncement] = useMutation(CREATE_CONTEST_ANNOUNCEMENT)

  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    resetField,
    formState: { errors }
  } = useForm<CreateAnnouncementInput>({
    resolver: valibotResolver(announcementSchema)
  })

  const onclickSeemore = () => {
    setOpenHistory(!openHistory)
    setSeemore(openHistory ? 'see more' : 'close')
    setSeemoreHeight(
      openHistory &&
        (updateHistory?.getContestUpdateHistories.updateHistories?.length ??
          0) > 3
        ? 'auto'
        : '149px'
    )
  }

  const onSubmitAnnouncement: SubmitHandler<CreateAnnouncementInput> = async (
    data
  ) => {
    try {
      await createAnnouncement({
        variables: {
          input: {
            contestId,
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
        <main className="flex flex-col py-6">
          <div className="mb-6 text-2xl font-semibold">Update History</div>
          <div
            id="historyBox"
            className="w-100% mb-[14px] h-[149px] overflow-auto rounded-xl border bg-white px-10 pb-[20px] pt-[18px]"
            style={{ height: seemoreHeight }}
          >
            {!updateHistory?.getContestUpdateHistories ||
              (updateHistory.getContestUpdateHistories.updateHistories
                .length === 0 && <p>no result.</p>)}
            {updateHistory?.getContestUpdateHistories.updateHistories.map(
              (history, index) => (
                <div
                  key={history.updatedAt}
                  className={
                    index === 0
                      ? 'text-primary flex w-full flex-wrap py-[6px] text-lg'
                      : 'flex w-full flex-wrap py-[6px] text-lg'
                  }
                >
                  <p>{`[`}</p>
                  <p>
                    {dateFormatter(history.updatedAt, 'YYYY-MM-DD HH:mm:ss')}
                  </p>
                  <p>{`] `}</p>
                  &nbsp;
                  <p>
                    Problem{' '}
                    {history.order !== null
                      ? convertToLetter(Number(history.order))
                      : ''}
                    &nbsp;
                    {':'}
                  </p>
                  &nbsp;
                  <div className="flex">
                    {history.updatedInfo.map((current, index) => (
                      <p key={current.updatedField}>
                        {current.current}
                        &nbsp;
                        {index < history.updatedInfo.length - 1 && '&'}
                        &nbsp;
                      </p>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
          <Button
            className="mb-16 bg-[#80808014] text-lg hover:bg-[#80808039]"
            onClick={() => {
              onclickSeemore()
            }}
          >
            <p className="text-[#8A8A8A]">{seemore}</p>
            &nbsp;
            <ChevronDown
              className={cn('w-4 text-[#8A8A8A]', openHistory && 'rotate-180')}
            />
          </Button>
          <form onSubmit={handleSubmit(onSubmitAnnouncement)}>
            <p className="mb-6 text-2xl font-semibold">Post New Announcement</p>
            <div className="mb-[10px]">
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
                <SelectTrigger className="h-12 rounded-full bg-white pl-[30px] text-xl font-medium text-[#474747]">
                  <SelectValue placeholder="Choose" />
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
                      key={problem.problemId}
                      value={problem.order.toString()}
                      className="hover:text-primary text-lg font-normal"
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
                className="min-h-[260px] rounded-xl bg-white px-[30px] py-6 text-lg font-normal text-black placeholder:text-[#3333334D] focus-visible:ring-0"
              />
              {errors.content && <ErrorMessage />}
            </div>
            <p className="mb-20 mt-2 text-base font-normal text-[#9B9B9B]">
              Posted announcement cannot be edited.
            </p>
            <Button type="submit" className="w-full text-lg font-bold">
              <BiSolidPencil className="white" />
              &nbsp; Post
            </Button>
          </form>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
