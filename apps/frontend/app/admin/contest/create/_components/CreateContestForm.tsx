'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import { createSchema } from '@/app/admin/contest/_libs/schemas'
import {
  CREATE_CONTEST,
  IMPORT_PROBLEMS_TO_CONTEST
} from '@/graphql/contest/mutations'
import { UPDATE_CONTEST_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateContestInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { ContestProblem } from '../../_libs/schemas'

interface CreateContestFormProps {
  children: ReactNode
  problems: ContestProblem[]
  setIsCreating: (isCreating: boolean) => void
}

export default function CreateContestForm({
  children,
  problems,
  setIsCreating
}: CreateContestFormProps) {
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

  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()

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

    setShouldSkipWarning(true)
    toast.success('Contest created successfully')
    router.push('/admin/contest')
    router.refresh()
  }

  return (
    <form
      className="flex w-[760px] flex-col gap-6"
      onSubmit={methods.handleSubmit(isSubmittable)}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </form>
  )
}
