'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import type {
  ContestManagerReviewer,
  ContestProblem
} from '@/app/admin/contest/_libs/schemas'
import {
  IMPORT_PROBLEMS_TO_CONTEST,
  REMOVE_PROBLEMS_FROM_CONTEST,
  UPDATE_CONTEST
} from '@/graphql/contest/mutations'
import { GET_CONTEST } from '@/graphql/contest/queries'
import { UPDATE_CONTEST_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { GET_CONTEST_PROBLEMS } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateContestInput } from '@generated/graphql'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'

interface EditContestFormProps {
  contestId: number
  children: ReactNode
  problems: ContestProblem[]
  managers: ContestManagerReviewer[]
  setProblems: (problems: ContestProblem[]) => void
  setManagers: (managers: ContestManagerReviewer[]) => void
  setIsLoading: (isLoading: boolean) => void
  methods: UseFormReturn<UpdateContestInput>
}

export function EditContestForm({
  contestId,
  children,
  problems,
  managers,
  setProblems,
  setManagers,
  setIsLoading,
  methods
}: EditContestFormProps) {
  const [prevProblemIds, setPrevProblemIds] = useState<number[]>([])

  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()

  // 수정된 manager, reviewer 목록(managers) 으로 등록
  const formattedManagers = managers
    .filter((manager) => manager.id !== null) // Exclude managers with null id
    .map((manager) => ({
      userId: manager.id,
      contestRole: manager.type
    }))
  methods.register('userContest')
  methods.setValue('userContest', formattedManagers)

  useQuery(GET_CONTEST, {
    variables: { contestId },
    onCompleted: (contestData) => {
      const data = contestData.getContest
      methods.reset({
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        isJudgeResultVisible: data.isJudgeResultVisible,
        invitationCode: data.invitationCode,
        summary: data.summary,
        posterUrl: data.posterUrl,
        freezeTime: data.freezeTime === null ? null : new Date(data.freezeTime),
        evaluateWithSampleTestcase: data.evaluateWithSampleTestcase,
        userContest: data.userContest?.map((role) => ({
          contestRole: role.role,
          // * 보류
          userId: role.userId ?? undefined
        }))
      })
      setIsLoading(false)
      setManagers(
        (data.userContest ?? [])
          .filter((user) => user.userId !== null && user.userId !== undefined)
          .map((user) => {
            return {
              id: user.userId || 0,
              email: user.user?.email || '',
              username: user.user?.username || '',
              realName: user.user?.userProfile?.realName || '',
              type: user.role
            }
          })
      )
    }
  })

  useQuery(GET_CONTEST_PROBLEMS, {
    variables: { contestId },
    onCompleted: (problemData) => {
      const data = problemData.getContestProblems

      setPrevProblemIds(data.map((problem) => problem.problemId))

      const contestProblems = data.map((problem) => {
        return {
          id: problem.problemId,
          title: problem.problem.title,
          order: problem.order,
          difficulty: problem.problem.difficulty,
          score: problem.score ?? 1 // Score 기능 완료되면 수정해주세요!!
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

  const isSubmittable = (input: UpdateContestInput) => {
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
    setIsLoading(true)
    await updateContest({
      variables: {
        contestId,
        input
      }
    })

    if (error) {
      toast.error('Failed to update contest')
      return
    }

    await removeProblemsFromContest({
      variables: {
        contestId,
        problemIds: prevProblemIds
      }
    })

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
    toast.success('Contest updated successfully')
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
