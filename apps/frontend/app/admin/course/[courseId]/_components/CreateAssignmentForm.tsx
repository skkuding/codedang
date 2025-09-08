'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import {
  CREATE_ASSIGNMENT,
  IMPORT_PROBLEMS_TO_ASSIGNMENT
} from '@/graphql/assignment/mutations'
import { UPDATE_ASSIGNMENT_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateAssignmentInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createSchema } from '../_libs/schemas'
import type { AssignmentProblem } from '../_libs/type'
import { isOptionAfterDeadline } from '../_libs/utils'

interface CreateAssignmentFormProps {
  groupId: string
  children: ReactNode
  problems: AssignmentProblem[]
  setIsCreating: (isCreating: boolean) => void
  isExercise?: boolean
}

export function CreateAssignmentForm({
  groupId,
  children,
  problems,
  setIsCreating,
  isExercise = false
}: CreateAssignmentFormProps) {
  const methods = useForm<CreateAssignmentInput>({
    resolver: valibotResolver(createSchema),
    defaultValues: {
      isRankVisible: true,
      isVisible: true,
      enableCopyPaste: true,
      isJudgeResultVisible: true,
      autoFinalizeScore: false,
      description: ''
    }
  })

  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()

  const [createAssignment, { error }] = useMutation(CREATE_ASSIGNMENT)
  const [importProblemsToAssignment] = useMutation(
    IMPORT_PROBLEMS_TO_ASSIGNMENT
  )
  const [updateAssignmentProblemsOrder] = useMutation(
    UPDATE_ASSIGNMENT_PROBLEMS_ORDER
  )

  const isSubmittable = (input: CreateAssignmentInput) => {
    if (input.startTime >= (input.dueTime ?? input.endTime)) {
      toast.error('Start time must be earlier than due time')
      return
    }

    if (input.dueTime > input.endTime) {
      toast.error('End time cannot be earlier than due time')
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

    const finalInput = {
      ...input,
      isExercise: isExercise ?? false,
      startTime: input.startTime,
      dueTime: input.dueTime,
      endTime: input.endTime ?? new Date('2999-12-31T23:59:59')
    }

    const { data } = await createAssignment({
      variables: {
        groupId: Number(groupId),
        input: finalInput
      }
    })

    const assignmentId = Number(data?.createAssignment.id)

    if (error) {
      toast.error('Failed to create assignment')
      setIsCreating(false)
      return
    }

    await importProblemsToAssignment({
      variables: {
        groupId: Number(groupId),
        assignmentId,
        assignmentProblemInput: problems.map((problem) => {
          return {
            problemId: problem.id,
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

    const orderArray = problems
      .sort((a, b) => a.order - b.order)
      .map((problem) => problem.id)

    await updateAssignmentProblemsOrder({
      variables: {
        groupId: Number(groupId),
        assignmentId,
        orders: orderArray
      }
    })

    setShouldSkipWarning(true)
    toast.success(
      isExercise
        ? 'Exercise created successfully'
        : 'Assignment created successfully'
    )
    router.push(
      isExercise
        ? (`/admin/course/${groupId}/exercise` as const)
        : (`/admin/course/${groupId}/assignment` as const)
    )
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
