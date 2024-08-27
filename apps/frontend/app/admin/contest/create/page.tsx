'use client'

import { DataTableAdmin } from '@/components/DataTableAdmin'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  CREATE_CONTEST,
  IMPORT_PROBLEMS_TO_CONTEST
} from '@/graphql/contest/mutations'
import { UPDATE_CONTEST_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateContestInput } from '@generated/graphql'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircleIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { FaAngleLeft } from 'react-icons/fa6'
import { IoMdCheckmarkCircleOutline } from 'react-icons/io'
import { toast } from 'sonner'
import DescriptionForm from '../../_components/DescriptionForm'
import FormSection from '../../_components/FormSection'
import SwitchField from '../../_components/SwitchField'
import TitleForm from '../../_components/TitleForm'
import { columns } from '../[id]/_components/Columns'
import ContestProblemListLabel from '../_components/ContestProblemListLabel'
import ImportProblemTable from '../_components/ImportProblemTable'
import TimeForm from '../_components/TimeForm'
import { type ContestProblem, createSchema } from '../utils'

export default function Page() {
  const [problems, setProblems] = useState<ContestProblem[]>([])
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [showImportDialog, setShowImportDialog] = useState<boolean>(false)

  const router = useRouter()

  const methods = useForm<CreateContestInput>({
    resolver: zodResolver(createSchema),
    defaultValues: {
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

  const onSubmit = async (input: CreateContestInput) => {
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
          onSubmit={handleSubmit(onSubmit)}
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
              title="Disable participants from Copy/Pasting"
            />
            <SwitchField
              name="isJudgeResultVisible"
              title="Hide scores from participants"
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <PlusCircleIcon className="h-4 w-4" />
                      <div className="mb-[2px] text-sm">Import Problem</div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="p-8">
                    <DialogHeader className="gap-2">
                      <DialogTitle>Importing from Problem List</DialogTitle>
                      <DialogDescription>
                        If contest problems are imported from the ‘All Problem
                        List’, the problems will automatically become invisible
                        state.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          className="bg-black hover:bg-black/70"
                          onClick={() => setShowImportDialog(true)}
                        >
                          Ok
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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
                defaultSortColumn="order"
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
