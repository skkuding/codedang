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
import { CREATE_CONTEST_ANNOUNCEMENT } from '@/graphql/contest/mutations'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import type { CreateAnnouncementInput } from '@generated/graphql'
import { usePathname } from 'next/navigation'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { toast } from 'sonner'
import { ConfirmNavigation } from '../../../../../_components/ConfirmNavigation'
import { ErrorMessage } from '../../../../../_components/ErrorMessage'

export default function Page() {
  const pathname = usePathname()
  const pathArr = pathname.split('/')
  const contestId = Number(pathArr[pathArr.length - 2])
  const client = useApolloClient()
  const { data: problemData } = useQuery(GET_CONTEST_PROBLEMS, {
    variables: { contestId: contestId }
  })
  console.log('problemData:', problemData)
  const [createAnnouncement] = useMutation(CREATE_CONTEST_ANNOUNCEMENT)
  const {
    handleSubmit,
    register,
    setValue,
    trigger,
    formState: { errors, isValid }
  } = useForm<CreateAnnouncementInput>()

  const onSubmitAnnouncement: SubmitHandler<CreateAnnouncementInput> = async (
    data
  ) => {
    try {
      await createAnnouncement({
        variables: {
          input: {
            contestId: contestId,
            problemId: data.problemId,
            content: data.content
          }
        }
      })

      toast.success('Announcement created successfully!')
    } catch (error) {
      //TODO: error handling
      console.error('Error creating Announcement:', error)
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <ConfirmNavigation>
      <ScrollArea className="w-full">
        <main className="flex flex-col gap-6 px-20 py-16">
          <div>Update History</div>
          <form onSubmit={handleSubmit(onSubmitAnnouncement)}>
            <p>Post New Announcement</p>
            <div className="flex flex-col gap-2">
              <Select
                onValueChange={(value) => {
                  setValue('problemId', Number(value))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose" />
                </SelectTrigger>
                <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                  {problemData?.getContestProblems.map((problem) => (
                    <SelectItem
                      key={problem.problemId}
                      value={problem.problemId.toString()}
                    >
                      {problem.problem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.problemId && (
                <ErrorMessage message={errors.problemId.message} />
              )}
            </div>
            <div>
              <Input id="announcement" {...register('content')} />
              {errors.content && <ErrorMessage />}
            </div>
            <Button type="submit">Submit</Button>
          </form>
        </main>
      </ScrollArea>
    </ConfirmNavigation>
  )
}
