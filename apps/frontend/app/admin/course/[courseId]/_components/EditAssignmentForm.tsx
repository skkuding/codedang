'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import { AlertModal } from '@/components/AlertModal'
import { ModalSection } from '@/components/ModalSection'
import {
  IMPORT_PROBLEMS_TO_ASSIGNMENT,
  REMOVE_PROBLEMS_FROM_ASSIGNMENT,
  UPDATE_ASSIGNMENT
} from '@/graphql/assignment/mutations'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import {
  UPDATE_ASSIGNMENT_PROBLEMS,
  UPDATE_ASSIGNMENT_PROBLEMS_ORDER
} from '@/graphql/problem/mutations'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateAssignmentInput } from '@generated/graphql'
import { useTranslate } from '@tolgee/react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import type { AssignmentProblem } from '../_libs/type'
import { isOptionAfterDeadline } from '../_libs/utils'

interface EditAssigmentFormProps {
  courseId: number
  assignmentId: number
  children: ReactNode
  problems: AssignmentProblem[]
  setProblems: (problems: AssignmentProblem[]) => void
  setIsLoading: (isLoading: boolean) => void
  methods: UseFormReturn<UpdateAssignmentInput>
  isExercise?: boolean
}

interface ProblemIdScoreAndTitle {
  problemId: number
  score: number
  title: string
}

export function EditAssignmentForm({
  courseId,
  assignmentId,
  children,
  problems,
  setProblems,
  setIsLoading,
  methods,
  isExercise = false
}: EditAssigmentFormProps) {
  const [prevProblems, setPrevProblems] = useState<ProblemIdScoreAndTitle[]>([])
  const [isUpcoming, setIsUpcoming] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()
  const { t } = useTranslate()

  useQuery(GET_ASSIGNMENT, {
    variables: { groupId: courseId, assignmentId },
    onCompleted: (assignmentData) => {
      const data = assignmentData.getAssignment
      methods.reset({
        id: assignmentId,
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        dueTime: data.dueTime ? new Date(data.dueTime) : null,
        endTime: new Date(data.endTime),
        enableCopyPaste: data.enableCopyPaste,
        isJudgeResultVisible: data.isJudgeResultVisible,
        autoFinalizeScore: data.autoFinalizeScore,
        isRankVisible: true,
        isVisible: true,
        week: data.week
      })
      setIsLoading(false)

      const now = dayjs()
      setIsUpcoming(now.isBefore(data.startTime))
    }
  })

  useQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId: courseId, assignmentId },
    onCompleted: (problemData) => {
      const data = problemData.getAssignmentProblems

      setPrevProblems(
        data.map((problem) => ({
          problemId: problem.problemId,
          score: problem.score ?? 0,
          title: problem.problem.title
        }))
      )

      const assignmentProblems = data.map((problem) => {
        return {
          id: problem.problemId,
          title: problem.problem.title,
          order: problem.order,
          difficulty: problem.problem.difficulty,
          score: problem.score ?? 0, // Score 기능 완료되면 수정해주세요!!
          solutionReleaseTime: problem.solutionReleaseTime,
          solution: problem.problem.solution ?? []
        }
      })
      setProblems(assignmentProblems)
    }
  })

  const [updateAssignment, { error }] = useMutation(UPDATE_ASSIGNMENT)
  const [importProblemsToAssignment] = useMutation(
    IMPORT_PROBLEMS_TO_ASSIGNMENT
  )
  const [removeProblemsFromAssignment] = useMutation(
    REMOVE_PROBLEMS_FROM_ASSIGNMENT
  )
  const [updateAssignmentProblemsOrder] = useMutation(
    UPDATE_ASSIGNMENT_PROBLEMS_ORDER
  )
  const [updateAssignmentProblems] = useMutation(UPDATE_ASSIGNMENT_PROBLEMS)

  const currentProblems = problems.map((problem) => ({
    problemId: problem.id,
    score: problem.score,
    solutionReleaseTime: problem.solutionReleaseTime
  }))
  const deletedProblemIds = prevProblems
    .filter((prev) => {
      return !currentProblems.find(
        (current) => current.problemId === prev.problemId
      )
    })
    .map((problem) => problem.problemId)
  const addedProblems = currentProblems.filter((current) => {
    return !prevProblems.find((prev) => prev.problemId === current.problemId)
  })
  const updatedProblemScores = currentProblems.filter((current) => {
    const prev = prevProblems.find(
      (prev) => prev.problemId === current.problemId
    )
    return prev && prev.score !== current.score
  })
  const scoreUpdatedProblemTitles = problems
    .filter((problem) => {
      return updatedProblemScores.find(
        (updated) => updated.problemId === problem.id
      )
    })
    .map((problem) => problem.title)
  const deletedProblemTitles = prevProblems
    .filter((prev) => {
      return deletedProblemIds.includes(prev.problemId)
    })
    .map((problem) => problem.title)

  const isSubmittable = (input: UpdateAssignmentInput) => {
    if (input.startTime >= (input.dueTime ?? input.endTime)) {
      toast.error(t('start_time_error'))
      return
    }

    if (input.dueTime > input.endTime) {
      toast.error(t('end_time_error'))
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
    if (
      !isUpcoming &&
      (deletedProblemIds.length > 0 || updatedProblemScores.length > 0)
    ) {
      setIsModalOpen(true)
      return
    }

    await proceedSubmit()
  }

  const proceedSubmit = async () => {
    const input = methods.getValues()

    setIsLoading(true)

    await updateAssignment({
      variables: {
        groupId: courseId,
        input
      }
    })

    if (error) {
      toast.error(t('update_assignment_error'))
      return
    }

    if (deletedProblemIds.length > 0) {
      await removeProblemsFromAssignment({
        variables: {
          groupId: courseId,
          assignmentId,
          problemIds: deletedProblemIds
        }
      })
    }

    if (addedProblems.length > 0) {
      await importProblemsToAssignment({
        variables: {
          groupId: courseId,
          assignmentId,
          assignmentProblemInput: addedProblems
        }
      })
    }

    const orderArray = problems
      .sort((a, b) => a.order - b.order)
      .map((problem) => problem.id)

    await updateAssignmentProblemsOrder({
      variables: {
        groupId: courseId,
        assignmentId,
        orders: orderArray
      }
    })

    await updateAssignmentProblems({
      variables: {
        groupId: courseId,
        assignmentId,
        assignmentProblemUpdateInput: currentProblems.map((problem) => {
          return {
            problemId: problem.problemId,
            score: problem.score,
            solutionReleaseTime: isOptionAfterDeadline(
              problem.solutionReleaseTime
            )
              ? (input.dueTime ?? input.endTime)
              : problem.solutionReleaseTime
          }
        })
      }
    })

    setShouldSkipWarning(true)
    toast.success(
      isExercise
        ? t('exercise_updated_success')
        : t('assignment_updated_success')
    )
    router.push(
      isExercise
        ? (`/admin/course/${courseId}/exercise` as const)
        : (`/admin/course/${courseId}/assignment` as const)
    )
    router.refresh()
  }

  const handleConfirm = async () => {
    setIsModalOpen(false)
    await proceedSubmit()
  }

  return (
    <form
      className="flex w-[760px] flex-col gap-6"
      onSubmit={methods.handleSubmit(isSubmittable)}
    >
      <FormProvider {...methods}>{children}</FormProvider>
      <AlertModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        type="confirm"
        size="md"
        title={t('confirm_save_change')}
        primaryButton={{
          text: t('confirm_button'),
          onClick: handleConfirm,
          variant: 'default'
        }}
      >
        <div className="flex h-full w-full flex-col gap-[20px]">
          {deletedProblemTitles.length > 0 && (
            <ModalSection
              title={t('delete_problems_title')}
              description={t('delete_problems_description')}
              items={deletedProblemTitles}
            />
          )}
          {scoreUpdatedProblemTitles.length > 0 && (
            <ModalSection
              title={t('score_updated_problems_title')}
              description={t('score_updated_problems_description')}
              items={scoreUpdatedProblemTitles}
            />
          )}
        </div>
      </AlertModal>
    </form>
  )
}
