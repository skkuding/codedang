'use client'

import { UPDATE_ASSIGNMENT_PROBLEM_RECORD } from '@/graphql/assignment/mutations'
import {
  GET_ASSIGNMENT_PROBLEM_RECORD,
  GET_ASSIGNMENT_SCORE_SUMMARIES,
  GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER
} from '@/graphql/assignment/queries'
import { useMutation, useQuery } from '@apollo/client'
import type { UpdateAssignmentProblemRecordInput } from '@generated/graphql'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useState, type ReactNode } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateAssignmentProblemRecordSchema } from '../_libs/schemas'

interface UpdateAssignmentProblemRecordFormProps {
  children: ReactNode
  groupId: number
  assignmentId: number
  userId: number
  problemId: number
  onCompleted: () => void
}

export function UpdateAssignmentProblemRecordForm({
  children,
  groupId,
  assignmentId,
  userId,
  problemId,
  onCompleted
}: UpdateAssignmentProblemRecordFormProps) {
  const [loading, setLoading] = useState(true)

  const methods = useForm<UpdateAssignmentProblemRecordInput>({
    resolver: valibotResolver(updateAssignmentProblemRecordSchema)
  })

  useQuery(GET_ASSIGNMENT_PROBLEM_RECORD, {
    variables: {
      groupId,
      assignmentId,
      userId,
      problemId
    },
    onCompleted: (recordData) => {
      const data = recordData.getAssignmentProblemRecord
      methods.reset({
        assignmentId,
        userId,
        problemId,
        finalScore: data.finalScore,
        comment: data.comment
      })
      setLoading(false)
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
            groupId,
            assignmentId,
            take: 1000
          }
        },
        {
          query: GET_ASSIGNMENT_SUBMISSION_SUMMARIES_OF_USER,
          variables: {
            groupId,
            assignmentId,
            userId,
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
        groupId,
        input
      }
    })
  })

  if (loading) {
    return null
  }

  return (
    <form onSubmit={onSubmit}>
      <FormProvider {...methods}>{children}</FormProvider>
    </form>
  )
}
