'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import {
  dateFormatter,
  fetcherWithAuth,
  getStatusWithStartEnd
} from '@/libs/utils'
import type { Assignment, AssignmentProblem } from '@/types/type'
import { useCallback, useEffect, useState } from 'react'
import { columns } from './_components/Columns'

interface AssignmentProblemProps {
  params: { courseId: string; assignmentId: string }
}

interface AssignmentApiResponse {
  data: AssignmentProblem[]
  total: number
}

export default function AssignmentProblem({ params }: AssignmentProblemProps) {
  const { courseId, assignmentId } = params

  const [assignmentStatus, setAssignmentStatus] = useState<string | null>(null)
  const [problems, setProblems] = useState<AssignmentProblem[]>([])
  const [fetchProblemStatusCode, setFetchProblemStatusCode] = useState<
    number | null
  >(null)

  const fetchAssignment = useCallback(async () => {
    try {
      const res = await fetcherWithAuth.get(`assignment/${assignmentId}`, {
        searchParams: {
          groupId: courseId
        }
      })
      if (!res.ok) {
        return
      }

      const assignmentData: Assignment = await res.json()
      const formattedStartTime = dateFormatter(
        assignmentData.startTime,
        'YYYY-MM-DD HH:mm:ss'
      )
      const formattedEndTime = dateFormatter(
        assignmentData.endTime,
        'YYYY-MM-DD HH:mm:ss'
      )
      setAssignmentStatus(
        getStatusWithStartEnd(formattedStartTime, formattedEndTime)
      )
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
    }
  }, [assignmentId, courseId])

  const fetchProblems = useCallback(async () => {
    try {
      const res = await fetcherWithAuth.get<AssignmentApiResponse>(
        `assignment/${assignmentId}/problem`,
        {
          searchParams: {
            groupId: courseId
          }
        }
      )
      setFetchProblemStatusCode(res.status)

      if (res.ok) {
        const problemsData = await res.json()
        setProblems(problemsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    }
  }, [assignmentId, courseId])

  const participateAssignment = useCallback(async () => {
    try {
      const res = await fetcherWithAuth.post(
        `assignment/${assignmentId}/participation`,
        {
          searchParams: {
            groupId: courseId
          }
        }
      )
      if (res.ok) {
        await fetchProblems()
      }
    } catch (error) {
      console.error('Failed to participate in assignment:', error)
    }
  }, [assignmentId, courseId, fetchProblems])

  useEffect(() => {
    if (assignmentStatus === null) {
      fetchAssignment()
      return
    }

    if (assignmentStatus === 'upcoming') {
      return
    }

    if (assignmentStatus !== 'upcoming') {
      if (fetchProblemStatusCode === null) {
        fetchProblems()
      } else if (fetchProblemStatusCode === 403) {
        participateAssignment()
      }
    }
  }, [
    assignmentStatus,
    fetchProblemStatusCode,
    fetchAssignment,
    fetchProblems,
    participateAssignment
  ])

  if (assignmentStatus === 'upcoming') {
    return (
      <div className="flex h-44 translate-y-[22px] items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1 font-mono">
          <p className="text-xl font-semibold">Access Denied</p>
          <p className="text-gray-500">
            You can access after the assignment started
          </p>
        </div>
      </div>
    )
  }

  return (
    <DataTable
      data={problems}
      columns={columns}
      headerStyle={{
        order: 'w-[6%]',
        title: 'text-left w-[36%]',
        submit: 'w-[18%]',
        submissionTime: 'w-[21%]',
        score: 'w-[10%]'
      }}
      linked
    />
  )
}
