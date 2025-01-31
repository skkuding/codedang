'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import {
  CREATE_ASSIGNMENT,
  IMPORT_PROBLEMS_TO_ASSIGNMENT
} from '@/graphql/assignment/mutations'
// import { UPDATE_ASSIGNMENT_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { CreateAssignmentInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { AssignmentProblem } from '../../_libs/schemas'
import { createSchema } from '../../_libs/schemas'

interface CreateAssignmentFormProps {
  groupId: string
  children: ReactNode
  problems: AssignmentProblem[]
  setIsCreating: (isCreating: boolean) => void
}

export function CreateAssignmentForm({
  groupId,
  children,
  problems,
  setIsCreating
}: CreateAssignmentFormProps) {
  const methods = useForm<CreateAssignmentInput>({
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

  const [createAssignment, { error }] = useMutation(CREATE_ASSIGNMENT)
  const [importProblemsToAssignment] = useMutation(
    IMPORT_PROBLEMS_TO_ASSIGNMENT
  )
  // const [updateAssignmentProblemsOrder] = useMutation(
  //   UPDATE_ASSIGNMENT_PROBLEMS_ORDER
  // )

  const isSubmittable = (input: CreateAssignmentInput) => {
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

    const { data } = await createAssignment({
      variables: {
        groupId: Number(groupId),
        input
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
        problemIdsWithScore: problems.map((problem) => {
          return {
            problemId: problem.id,
            score: problem.score
          }
        })
      }
    })

    // TODO: 백엔드 작업 완료되면 Assignment problem order 변경 기능 추가
    // const orderArray = problems
    //   .sort((a, b) => a.order - b.order)
    //   .map((problem) => problem.id)

    // await updateAssignmentProblemsOrder({
    //   variables: {
    //     groupId: 1,
    //     assignmentId,
    //     orders: orderArray
    //   }
    // })

    setShouldSkipWarning(true)
    toast.success('Assignment created successfully')
    router.push(`/admin/group/${groupId}/assignment` as Route)
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
