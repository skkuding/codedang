'use client'

import { useConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import DescriptionForm from '@/app/admin/_components/DescriptionForm'
import FormSection from '@/app/admin/_components/FormSection'
import SwitchField from '@/app/admin/_components/SwitchField'
import TitleForm from '@/app/admin/_components/TitleForm'
import { DataTableAdmin } from '@/components/DataTableAdmin'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  IMPORT_PROBLEMS_TO_CONTEST,
  UPDATE_CONTEST,
  REMOVE_PROBLEMS_FROM_CONTEST
} from '@/graphql/contest/mutations'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { UPDATE_CONTEST_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { GET_CONTEST_SUBMISSIONS_COUNT } from '@/graphql/submission/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateContestInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { toast } from 'sonner'
import ContestProblemListLabel from '../../_components/ContestProblemListLabel'
import ImportProblemTable from '../../_components/ImportProblemTable'
import TimeForm from '../../_components/TimeForm'
import { type ContestProblem, editSchema } from '../../utils'
import { columns } from '../_components/Columns'

export default function Page({ params }: { params: { id: string } }) {
  const [prevProblemIds, setPrevProblemIds] = useState<number[]>([])
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [enableCopyPaste, setEnableCopyPaste] = useState<boolean>(false)
  const [isJudgeResultVisible, setIsJudgeResultVisible] =
    useState<boolean>(false)
  const [showInvitationCode, setShowInvitationCode] = useState<boolean>(false)
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false)
  const { id } = params

  const shouldSkipWarning = useRef(false)
  const hasSubmission = useRef(false)
  const router = useRouter()

  useConfirmNavigation(shouldSkipWarning)

  const methods = useForm<UpdateContestInput>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      isRankVisible: true,
      isVisible: true
    }
  })

  const { handleSubmit, getValues, setValue } = methods

  useQuery(GET_CONTEST_SUBMISSIONS_COUNT, {
    variables: {
      input: {
        contestId: Number(id)
      },
      take: 2
    },
    onCompleted: (data) => {
      if (data.getContestSubmissions.length !== 0) {
        hasSubmission.current = true
      }
    }
  })

  useQuery(GET_CONTEST, {
    variables: { contestId: Number(id) },
    onCompleted: (contestData) => {
      setValue('id', Number(id))
      const data = contestData.getContest
      setValue('title', data.title)
      setValue('description', data.description)
      setValue('startTime', new Date(data.startTime))
      setValue('endTime', new Date(data.endTime))
      setValue('enableCopyPaste', data.enableCopyPaste)
      setValue('isJudgeResultVisible', data.isJudgeResultVisible)
      setValue('invitationCode', data.invitationCode)
      if (data.invitationCode) {
        setShowInvitationCode(true)
      }
      if (data.enableCopyPaste) {
        setEnableCopyPaste(true)
      }
      if (data.isJudgeResultVisible) {
        setIsJudgeResultVisible(true)
      }
      setIsLoading(false)
    }
  })

  useQuery(GET_CONTEST_PROBLEMS, {
    variables: { groupId: 1, contestId: Number(id) },
    onCompleted: (problemData) => {
      const data = problemData.getContestProblems

      setPrevProblemIds(data.map((problem) => problem.problemId))

      const contestProblems = data.map((problem) => {
        return {
          id: problem.problemId,
          title: problem.problem.title,
          order: problem.order,
          difficulty: problem.problem.difficulty,
          score: problem.score ?? 0 // Score 기능 완료되면 수정해주세요!!
        }
      })
      setProblems(contestProblems)
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

    if (
      new Set(problems.map((problem) => problem.order)).size !== problems.length
    ) {
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

    if (hasSubmission.current) {
      await new Promise<void>((resolve) => {
        toast.warning(
          'Submissions exist. Only contest changes, excluding changes to the contest problems, will be saved.',
          {
            onAutoClose: () => {
              resolve()
            },
            duration: 4000
          }
        )
      })
    } else {
      await removeProblemsFromContest({
        variables: {
          groupId: 1,
          contestId: Number(id),
          problemIds: prevProblemIds
        }
      })
      await importProblemsToContest({
        variables: {
          groupId: 1,
          contestId: Number(id),
          problemIdsWithScore: problems.map((problem) => {
            return {
              problemId: problem.id,
              score: problem.score
            }
          })
        }
      })
      const orderArray = problems
        .sort((a, b) => a.order - b.order)
        .map((problem) => problem.id)
      await updateContestProblemsOrder({
        variables: {
          groupId: 1,
          contestId: Number(id),
          orders: orderArray
        }
      })
    }

    shouldSkipWarning.current = true
    toast.success('Contest updated successfully')
    router.push('/admin/contest')
    router.refresh()
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
          <FormProvider {...methods}>
            <FormSection title="Title">
              <TitleForm placeholder="Name your contest" />
            </FormSection>
            <div className="flex gap-6">
              <FormSection title="Start Time">
                {getValues('startTime') && <TimeForm name="startTime" />}
              </FormSection>
              <FormSection title="End Time">
                {getValues('endTime') && <TimeForm name="endTime" />}
              </FormSection>
            </div>
            <FormSection title="Description">
              {getValues('description') && (
                <DescriptionForm name="description" />
              )}
            </FormSection>
            <SwitchField
              name="enableCopyPaste"
              title="Enable participants Copy/Pasting"
              hasValue={enableCopyPaste}
            />
            <SwitchField
              name="isJudgeResultVisible"
              title="Reveal scores to participants"
              hasValue={isJudgeResultVisible}
            />
            <SwitchField
              name="invitationCode"
              title="Invitation Code"
              type="number"
              formElement="input"
              placeholder="Enter a invitation code"
              hasValue={showInvitationCode}
            />
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <ContestProblemListLabel />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      className="flex h-[36px] w-48 items-center gap-2 px-0"
                    >
                      <PlusCircleIcon className="h-4 w-4" />
                      <div className="mb-[2px] text-sm">
                        Import · Edit problem
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="p-8">
                    <AlertDialogHeader className="gap-2">
                      <AlertDialogTitle>
                        Importing from Problem List
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        If contest problems are imported from the ‘All Problem
                        List’, the problems will automatically become invisible
                        state.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-md px-4 py-2">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          type="button"
                          onClick={() => setShowImportDialog(true)}
                        >
                          Ok
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Dialog
                  open={showImportDialog}
                  onOpenChange={setShowImportDialog}
                >
                  <DialogContent className="w-[1280px] max-w-[1280px]">
                    <DialogHeader>
                      <DialogTitle>Import Problem</DialogTitle>
                    </DialogHeader>
                    <ImportProblemTable
                      checkedProblems={problems as ContestProblem[]}
                      onSelectedExport={(problems) =>
                        setProblems(problems as ContestProblem[])
                      }
                      onCloseDialog={() => setShowImportDialog(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <DataTableAdmin
                // eslint-disable-next-line
                columns={columns(problems, setProblems) as any[]}
                data={problems as ContestProblem[]}
                defaultSortColumn={{ id: 'order', desc: false }}
                enableFooter={true}
                defaultPageSize={20}
              />
            </div>
            <Button
              type="submit"
              className="flex h-[36px] w-[90px] items-center gap-2 px-0"
              disabled={isLoading}
            >
              <IoIosCheckmarkCircle fontSize={20} />
              <div className="text-base">Edit</div>
            </Button>
          </FormProvider>
        </form>
      </main>
    </ScrollArea>
  )
}
