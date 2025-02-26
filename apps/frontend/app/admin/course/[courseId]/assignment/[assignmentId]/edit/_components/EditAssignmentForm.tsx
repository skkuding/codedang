'use client'

import { useConfirmNavigationContext } from '@/app/admin/_components/ConfirmNavigation'
import {
  IMPORT_PROBLEMS_TO_ASSIGNMENT,
  REMOVE_PROBLEMS_FROM_ASSIGNMENT,
  UPDATE_ASSIGNMENT
} from '@/graphql/assignment/mutations'
import { GET_ASSIGNMENT } from '@/graphql/assignment/queries'
import { UPDATE_ASSIGNMENT_PROBLEMS_ORDER } from '@/graphql/problem/mutations'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateAssignmentInput } from '@generated/graphql'
import { useRouter } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { FormProvider, type UseFormReturn } from 'react-hook-form'
import { toast } from 'sonner'
import type { AssignmentProblem } from '../../../_libs/type'

interface EditAssigmentFormProps {
  courseId: number
  assignmentId: number
  children: ReactNode
  problems: AssignmentProblem[]
  setProblems: (problems: AssignmentProblem[]) => void
  setIsLoading: (isLoading: boolean) => void
  methods: UseFormReturn<UpdateAssignmentInput>
}

export function EditAssignmentForm({
  courseId,
  assignmentId,
  children,
  problems,
  setProblems,
  setIsLoading,
  methods
}: EditAssigmentFormProps) {
  const [prevProblemIds, setPrevProblemIds] = useState<number[]>([])

  const { setShouldSkipWarning } = useConfirmNavigationContext()
  const router = useRouter()

  useQuery(GET_ASSIGNMENT, {
    variables: { groupId: courseId, assignmentId },
    onCompleted: (assignmentData) => {
      const data = assignmentData.getAssignment
      methods.reset({
        id: assignmentId,
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        enableCopyPaste: data.enableCopyPaste,
        isJudgeResultVisible: data.isJudgeResultVisible,
        isRankVisible: true,
        isVisible: true
      })
      setIsLoading(false)
    }
  })

  useQuery(GET_ASSIGNMENT_PROBLEMS, {
    variables: { groupId: courseId, assignmentId },
    onCompleted: (problemData) => {
      const data = problemData.getAssignmentProblems

      setPrevProblemIds(data.map((problem) => problem.problemId))

      const assignmentProblems = data.map((problem) => {
        return {
          id: problem.problemId,
          title: problem.problem.title,
          order: problem.order,
          difficulty: problem.problem.difficulty,
          score: problem.score ?? 0 // Score 기능 완료되면 수정해주세요!!
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

  const isSubmittable = (input: UpdateAssignmentInput) => {
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

    await updateAssignment({
      variables: {
        groupId: courseId,
        input
      }
    })

    if (error) {
      toast.error('Failed to update assignment')
      return
    }

    await removeProblemsFromAssignment({
      variables: {
        groupId: courseId,
        assignmentId,
        problemIds: prevProblemIds
      }
    })

    await importProblemsToAssignment({
      variables: {
        groupId: courseId,
        assignmentId,
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

    await updateAssignmentProblemsOrder({
      variables: {
        groupId: courseId,
        assignmentId,
        orders: orderArray
      }
    })

    setShouldSkipWarning(true)
    toast.success('Assignment updated successfully')
    router.push(`/admin/course/${courseId}`)
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
