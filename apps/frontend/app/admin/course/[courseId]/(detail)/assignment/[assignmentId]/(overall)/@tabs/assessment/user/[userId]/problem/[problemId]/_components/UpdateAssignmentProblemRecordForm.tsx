'use client'

import { UPDATE_ASSIGNMENT_PROBLEM_RECORD } from '@/graphql/assignment/mutations'
import {
  GET_ASSIGNMENT_PROBLEM_RECORD,
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER
} from '@/graphql/assignment/queries'
import { useSuspenseQuery, useMutation } from '@apollo/client'
import type { UpdateAssignmentProblemRecordInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useParams } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateAssignmentProblemRecordSchema } from '../_libs/schemas'

interface UpdateAssignmentProblemRecordFormProps {
  children: React.ReactNode
  onCompleted: () => void
}

export function UpdateAssignmentProblemRecordForm({
  children,
  onCompleted
}: UpdateAssignmentProblemRecordFormProps) {
  const params = useParams<{
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }>()
  const { courseId, assignmentId, userId, problemId } = params

  const {
    data: { getAssignmentProblemRecord }
  } = useSuspenseQuery(GET_ASSIGNMENT_PROBLEM_RECORD, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId),
      userId: Number(userId),
      problemId: Number(problemId)
    }
  })

  const methods = useForm<UpdateAssignmentProblemRecordInput>({
    resolver: valibotResolver(updateAssignmentProblemRecordSchema),
    defaultValues: {
      assignmentId: Number(assignmentId),
      userId: Number(userId),
      problemId: Number(problemId),
      finalScore: getAssignmentProblemRecord.finalScore ?? null,
      comment: getAssignmentProblemRecord.comment ?? ''
    }
  })

  const [updateAssignmentProblemRecord] = useMutation(
    UPDATE_ASSIGNMENT_PROBLEM_RECORD,
    {
      onError: () => {
        toast.error('Failed to update assessment')
      },
      onCompleted: () => {
        toast.success('Assessment updated successfully')
        onCompleted()
      },
      refetchQueries: [
        {
          query: GET_ASSIGNMENT_SCORE_SUMMARIES,
          variables: {
            groupId: Number(courseId),
            assignmentId: Number(assignmentId),
            take: 1000
          }
        },
        {
          query: GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER,
          variables: {
            groupId: Number(courseId),
            assignmentId: Number(assignmentId),
            userId: Number(userId),
            take: 1000
          }
        }
      ]
    }
  )

  const onSubmit = methods.handleSubmit(async () => {
    const input = methods.getValues()
    await updateAssignmentProblemRecord({
      variables: {
        groupId: Number(courseId),
        input
      }
    })
  })

  return (
    <form onSubmit={onSubmit}>
      <FormProvider {...methods}>{children}</FormProvider>
    </form>
  )
}
