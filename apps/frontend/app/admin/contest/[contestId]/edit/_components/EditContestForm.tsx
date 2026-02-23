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
import type { UpdateContestInfo } from '@/types/type'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateContestInput } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, type ReactNode } from 'react'
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
  methods: UseFormReturn<UpdateContestInfo>
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
  const { t } = useTranslate()
  const [prevProblemIds, setPrevProblemIds] = useState<number[]>([])

  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()

  // 수정된 manager, reviewer 목록(managers)으로 등록
  const formattedManagers = managers
    .filter((manager) => manager.id !== null) // Exclude managers with null id
    .map((manager) => ({
      userId: manager.id,
      contestRole: manager.type
    }))
  methods.register('userContest')
  methods.setValue('userContest', formattedManagers)

  const { data: contestData } = useQuery(GET_CONTEST, {
    variables: { contestId }
  })
  // NOTE: 기존 useQuery의 onCompleted 대신 useEffect를 사용하여 managers와 problems를 업데이트.
  // useQuery는 내부적으로 비동기 처리이기 때문에, 컴포넌트가 렌더링되기도 전에 onCompleted 콜백이 실행될 수 있음(콘솔 경고 뜸).
  useEffect(() => {
    if (contestData) {
      const data = contestData.getContest
      methods.reset({
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        registerDueTime: new Date(data.registerDueTime),
        isJudgeResultVisible: data.isJudgeResultVisible,
        invitationCode: data.invitationCode,
        summary: data.summary,
        posterUrl: data.posterUrl,
        freezeTime: data.freezeTime === null ? null : new Date(data.freezeTime),
        enableCopyPaste: data.enableCopyPaste,
        evaluateWithSampleTestcase: data.evaluateWithSampleTestcase,
        userContest: data.userContest?.map((role) => ({
          contestRole: role.role,
          userId: role.userId ?? undefined
        })),
        // contestRecord -> 대회 참여자 목록 확인을 위함(delete 후 서버에 보내지 않음)
        contestRecord: (data.contestRecord ?? [])
          .filter((record) => record.userId !== null)
          .map((record) => ({
            ...record,
            userId: record.userId as number,
            user: record.user
              ? {
                  username: record.user.username,
                  email: record.user.email
                }
              : undefined
          }))
      })
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
      setIsLoading(false)
    }
  }, [contestData, methods, setManagers, setIsLoading])

  const { data: problemData } = useQuery(GET_CONTEST_PROBLEMS, {
    variables: { contestId }
  })

  useEffect(() => {
    if (problemData) {
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
  }, [problemData, setPrevProblemIds, setProblems])

  const [updateContest, { error }] = useMutation(UPDATE_CONTEST)
  const [importProblemsToContest] = useMutation(IMPORT_PROBLEMS_TO_CONTEST)
  const [removeProblemsFromContest] = useMutation(REMOVE_PROBLEMS_FROM_CONTEST)
  const [updateContestProblemsOrder] = useMutation(
    UPDATE_CONTEST_PROBLEMS_ORDER
  )

  const isSubmittable = (input: UpdateContestInput) => {
    if (input.startTime >= input.endTime) {
      toast.error(t('start_time_error'))
      return
    }
    if (
      new Set(problems.map((problem) => problem.order)).size !== problems.length
    ) {
      toast.error(t('duplicate_order_error'))
      return
    }
    onSubmit()
  }

  const onSubmit = async () => {
    const input = methods.getValues()
    delete input.contestRecord // contestRecord는 서버에 보내지 않음

    setIsLoading(true)
    await updateContest({
      variables: {
        contestId,
        input
      }
    })

    if (error) {
      toast.error(t('update_contest_failed'))
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
    toast.success(t('contest_updated'))
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
