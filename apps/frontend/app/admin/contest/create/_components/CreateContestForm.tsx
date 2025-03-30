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
import type {
  ContestManagerReviewer,
  ContestProblem
} from '../../_libs/schemas'

interface CreateContestFormProps {
  children: ReactNode
  problems: ContestProblem[]
  managers: ContestManagerReviewer[]
  setIsCreating: (isCreating: boolean) => void
}

export function CreateContestForm({
  children,
  problems,
  managers,
  setIsCreating
}: CreateContestFormProps) {
  const methods = useForm<CreateContestInput>({
    resolver: valibotResolver(createSchema),
    defaultValues: {
      invitationCode: null,
      enableCopyPaste: false,
      isJudgeResultVisible: false,
      description: null
    }
  })

  const formattedManagers = managers.map((manager) => ({
    userId: manager.id,
    contestRole: manager.type
  }))

  methods.register('userContest')
  methods.setValue('userContest', formattedManagers)

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
      className="flex w-[901px] flex-col gap-[60px]"
      onSubmit={methods.handleSubmit(isSubmittable)}
    >
      <FormProvider {...methods}>{children}</FormProvider>
    </form>
  )
}
