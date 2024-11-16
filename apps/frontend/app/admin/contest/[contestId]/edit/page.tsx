'use client'

import { useConfirmNavigation } from '@/app/admin/_components/ConfirmNavigation'
import DescriptionForm from '@/app/admin/_components/DescriptionForm'
import FormSection from '@/app/admin/_components/FormSection'
import SwitchField from '@/app/admin/_components/SwitchField'
import TitleForm from '@/app/admin/_components/TitleForm'
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
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import {
  IMPORT_PROBLEMS_TO_CONTEST,
  UPDATE_CONTEST,
  REMOVE_PROBLEMS_FROM_CONTEST
} from '@/graphql/contest/mutations'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { UPDATE_CONTEST_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateContestInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoIosCheckmarkCircle } from 'react-icons/io'
import { toast } from 'sonner'
import ContestProblemListLabel from '../../_components/ContestProblemListLabel'
import ContestProblemTable from '../../_components/ContestProblemTable'
import {
  ImportProblemTable,
  ImportProblemTableFallback
} from '../../_components/ImportProblemTable'
import TimeForm from '../../_components/TimeForm'
import { type ContestProblem, editSchema } from '../../_libs/schemas'

export default function Page({ params }: { params: { contestId: string } }) {
  const [prevProblemIds, setPrevProblemIds] = useState<number[]>([])
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [enableCopyPaste, setEnableCopyPaste] = useState<boolean>(false)
  const [isJudgeResultVisible, setIsJudgeResultVisible] =
    useState<boolean>(false)
  const [showInvitationCode, setShowInvitationCode] = useState<boolean>(false)
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false)
  const { contestId } = params

  const shouldSkipWarning = useRef(false)
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

  useQuery(GET_CONTEST, {
    variables: { contestId: Number(contestId) },
    onCompleted: (contestData) => {
      setValue('id', Number(contestId))
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
    variables: { groupId: 1, contestId: Number(contestId) },
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

    await removeProblemsFromContest({
      variables: {
        groupId: 1,
        contestId: Number(contestId),
        problemIds: prevProblemIds
      }
    })
    await importProblemsToContest({
      variables: {
        groupId: 1,
        contestId: Number(contestId),
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
        contestId: Number(contestId),
        orders: orderArray
      }
    })

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
                    <Suspense fallback={<ImportProblemTableFallback />}>
                      <ImportProblemTable
                        checkedProblems={problems}
                        onSelectedExport={(problems) => {
                          setProblems(problems)
                          setShowImportDialog(false)
                        }}
                      />
                    </Suspense>
                  </DialogContent>
                </Dialog>
              </div>
              <ContestProblemTable
                problems={problems}
                setProblems={setProblems}
                disableInput={false}
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
