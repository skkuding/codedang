'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import {
  CREATE_CONTEST,
  IMPORT_PROBLEMS_TO_CONTEST
} from '@/graphql/contest/mutations'
import { UPDATE_CONTEST_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateContestInput } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { FormProvider } from 'react-hook-form'
import type { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type {
  ContestManagerReviewer,
  ContestProblem
} from '../../_libs/schemas'

interface CreateContestFormProps {
  children: ReactNode
  methods: ReturnType<typeof useForm<CreateContestInput>>
  problems: ContestProblem[]
  managers: ContestManagerReviewer[]
  setIsCreating: (isCreating: boolean) => void
}

export function CreateContestForm({
  children,
  methods,
  problems,
  managers,
  setIsCreating
}: CreateContestFormProps) {
  const { t } = useTranslate()

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
      toast.error(t('start_time_error'))
      return
    }
    if (input.registerDueTime >= input.startTime) {
      toast.error(t('join_duetime_error'))
      return
    }

    if (
      new Set(problems.map((problem) => problem.order)).size !== problems.length
    ) {
      toast.error(t('duplicate_problem_order_error'))
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
      toast.error(t('create_contest_failed'))
      setIsCreating(false)
      return
    }

    await importProblemsToContest({
      variables: {
        contestId,
        problemIdsWithScore: problems.map((problem) => {
          return {
            problemId: problem.id,
            score: problem.score ?? 1
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
    toast.success(t('contest_create_success'))
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
