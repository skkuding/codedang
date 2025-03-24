'use client'

import { DataTable } from '@/app/(client)/(main)/_components/DataTable'
import {
  dateFormatter,
  fetcherWithAuth,
  getStatusWithStartEnd
} from '@/libs/utils'
import type {
  Assignment,
  AssignmentGrade,
  AssignmentProblem,
  ProblemGrade
} from '@/types/type'
import { useCallback, useEffect, useState } from 'react'
import { columns } from './_components/Columns'

interface AssignmentProblemProps {
  params: { courseId: string; assignmentId: string }
}

export default function AssignmentProblem({ params }: AssignmentProblemProps) {
  const { courseId, assignmentId } = params

  const [assignmentStatus, setAssignmentStatus] = useState<string | null>(null)
  const [assignmentGrade, setAssignmentGrade] = useState<AssignmentGrade>()
  const [problems, setProblems] = useState<ProblemGrade[]>([])
  const [fetchProblemStatusCode, setFetchProblemStatusCode] = useState<
    number | null
  >(null)

  const fetchAssignmentStatus = useCallback(async () => {
    try {
      const res = await fetcherWithAuth.get(`assignment/${assignmentId}`)
      if (!res.ok) {
        return
      }

      const assignmentData: Assignment = await res.json()
      const formattedStartTime = dateFormatter(
        assignmentData.startTime,
        'MMM DD, YYYY HH:mm'
      )
      const formattedEndTime = dateFormatter(
        assignmentData.endTime,
        'MMM DD, YYYY HH:mm'
      )
      setAssignmentStatus(
        getStatusWithStartEnd(formattedStartTime, formattedEndTime)
      )
    } catch (error) {
      console.error('Failed to fetch assignment:', error)
    }
  }, [assignmentId])

  const fetchAssignmentGrade = useCallback(async () => {
    try {
      console.log('Fetching assignment grade...') // 호출 확인
      const res = await fetcherWithAuth.get(
        `assignment/${assignmentId}/score/me`
      )
      if (!res.ok) {
        return
      }

      const assignmentGradeData: AssignmentGrade = await res.json()

      setAssignmentGrade(assignmentGradeData)
    } catch (error) {
      console.error('Failed to fetch assignment grade:', error)
    }
  }, [assignmentId])

  const fetchProblems = useCallback(async () => {
    try {
      const res = await fetcherWithAuth.get<AssignmentGrade>(
        `assignment/${assignmentId}/score/me`
      )
      setFetchProblemStatusCode(res.status)

      if (res.ok) {
        const problemsData = await res.json()
        setProblems(problemsData.problems)
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error)
    }
  }, [assignmentId])

  const participateAssignment = useCallback(async () => {
    try {
      await fetcherWithAuth.post(`assignment/${assignmentId}/participation`, {
        searchParams: {
          groupId: courseId
        }
      })
    } catch (error) {
      console.error('Failed to participate in assignment:', error)
    }
  }, [assignmentId, courseId])

  useEffect(() => {
    if (assignmentStatus === null) {
      fetchAssignmentStatus()
      return
    }

    if (assignmentStatus === 'upcoming') {
      return
    }

    fetchProblems()
    fetchAssignmentGrade()
    if (fetchProblemStatusCode === 403) {
      participateAssignment()
      fetchProblems()
    }
  }, [
    assignmentStatus,
    fetchAssignmentGrade,
    fetchAssignmentStatus,
    fetchProblemStatusCode,
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

  if (!assignmentGrade) {
    console.log('fail')
    return null // assignmentGrade가 없으면 렌더링하지 않음
  }

  return (
    <DataTable
      data={problems}
      columns={columns(assignmentGrade)} // assignment 전달
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
