'use client'

import FetchErrorFallback from '@/components/FetchErrorFallback'
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
  CREATE_CONTEST,
  IMPORT_PROBLEMS_TO_CONTEST
} from '@/graphql/contest/mutations'
import { UPDATE_CONTEST_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateContestInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { ErrorBoundary } from '@suspensive/react'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, Suspense } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { toast } from 'sonner'
import { useConfirmNavigation } from '../../_components/ConfirmNavigation'
import DescriptionForm from '../../_components/DescriptionForm'
import FormSection from '../../_components/FormSection'
import SwitchField from '../../_components/SwitchField'
import TitleForm from '../../_components/TitleForm'
import ContestProblemListLabel from '../_components/ContestProblemListLabel'
import ContestProblemTable from '../_components/ContestProblemTable'
import {
  ImportProblemTable,
  ImportProblemTableFallback
} from '../_components/ImportProblemTable'
import TimeForm from '../_components/TimeForm'
import { type ContestProblem, createSchema } from '../_libs/schemas'

export default function Page() {
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false)

  const shouldSkipWarning = useRef(false)
  const router = useRouter()

  useConfirmNavigation(shouldSkipWarning)

  const methods = useForm<CreateContestInput>({
    resolver: valibotResolver(createSchema),
    defaultValues: {
      invitationCode: null,
      isRankVisible: true,
      isVisible: true,
      enableCopyPaste: false,
      isJudgeResultVisible: false
    }
  })

  const { handleSubmit } = methods

  const [createContest, { error }] = useMutation(CREATE_CONTEST)
  const [importProblemsToContest] = useMutation(IMPORT_PROBLEMS_TO_CONTEST)
  const [updateContestProblemsOrder] = useMutation(
    UPDATE_CONTEST_PROBLEMS_ORDER
  )

  const isSubmittable = (input: CreateContestInput) => {
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
    onSubmit()
  }

  const onSubmit = async () => {
    const input = methods.getValues()
    setIsCreating(true)

    const { data } = await createContest({
      variables: {
        groupId: 1,
        input
      }
    })

    const contestId = Number(data?.createContest.id)
    if (error) {
      toast.error('Failed to create contest')
      setIsCreating(false)
      return
    }
    await importProblemsToContest({
      variables: {
        groupId: 1,
        contestId,
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
        contestId,
        orders: orderArray
      }
    })

    shouldSkipWarning.current = true
    toast.success('Contest created successfully')
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
          <span className="text-4xl font-bold">Create Contest</span>
        </div>
        <form
          onSubmit={handleSubmit(isSubmittable)}
          className="flex w-[760px] flex-col gap-6"
        >
          <FormProvider {...methods}>
            <FormSection title="Title">
              <TitleForm placeholder="Name your contest" />
            </FormSection>
            <div className="flex gap-6">
              <FormSection title="Start Time">
                <TimeForm name="startTime" />
              </FormSection>
              <FormSection title="End Time">
                <TimeForm name="endTime" />
              </FormSection>
            </div>
            <FormSection title="Description">
              <DescriptionForm name="description" />
            </FormSection>
            <SwitchField
              name="enableCopyPaste"
              title="Enable participants Copy/Pasting"
            />
            <SwitchField
              name="isJudgeResultVisible"
              title="Reveal scores to participants"
            />
            <SwitchField
              name="invitationCode"
              title="Invitation Code"
              type="number"
              formElement="input"
              placeholder="Enter a invitation code"
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
                    <ErrorBoundary fallback={FetchErrorFallback}>
                      <Suspense fallback={<ImportProblemTableFallback />}>
                        <ImportProblemTable
                          checkedProblems={problems}
                          onSelectedExport={(problems) => {
                            setProblems(problems)
                            setShowImportDialog(false)
                          }}
                        />
                      </Suspense>
                    </ErrorBoundary>
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
              className="flex h-[36px] w-[100px] items-center gap-2 px-0"
              disabled={isCreating}
            >
              <IoMdCheckmarkCircleOutline fontSize={20} />
              <div className="mb-[2px] text-base">Create</div>
            </Button>
          </FormProvider>
        </form>
      </main>
    </ScrollArea>
  )
}
