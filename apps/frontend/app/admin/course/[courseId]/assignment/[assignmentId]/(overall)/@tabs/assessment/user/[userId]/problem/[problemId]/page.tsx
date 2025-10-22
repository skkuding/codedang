'use client'

import { mapTestResults } from '@/app/admin/_components/code-editor/libs/util'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { GET_PROBLEM_TESTCASE } from '@/graphql/problem/queries'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import { useQuery, useSuspenseQuery } from '@apollo/client'
import type { SubmissionDetail, TestCaseResult } from '@generated/graphql'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, use, useEffect, useState } from 'react'
import { SubmissionAssessment } from './_components/SubmissionAssessment'
import { SubmissionSummary } from './_components/SubmissionSummary'
import { SubmissionTestcase } from './_components/SubmissionTestcase'

interface PageProps {
  params: Promise<{
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }>
}

export default function Page(props: PageProps) {
  const params = use(props.params)
  const { courseId, assignmentId, userId, problemId } = params
  const [testResults, setTestResults] = useState<
    (TestCaseResult & {
      expectedOutput: string
      order: number
      input: string
    })[]
  >([])

  const { data: submissionResponse, error } = useSuspenseQuery(
    GET_ASSIGNMENT_LATEST_SUBMISSION,
    {
      variables: {
        groupId: Number(courseId),
        assignmentId: Number(assignmentId),
        userId: Number(userId),
        problemId: Number(problemId)
      }
    }
  )

  const { data: problemResponse } = useSuspenseQuery(GET_PROBLEM_TESTCASE, {
    variables: {
      id: Number(problemId)
    }
  })
  const submissionData = submissionResponse?.getAssignmentLatestSubmission
  const testcaseData = problemResponse?.getProblem?.testcase

  useEffect(() => {
    const mappedResults = mapTestResults(
      testcaseData,
      submissionData.testcaseResult
    )
    setTestResults(mappedResults)
  }, [submissionData])

  if (error) {
    return (
      <div>
        <div className="px-6 py-4">
          <SubmissionSummary submission={null} />
        </div>

        <div className="h-3 bg-[#121728]" />

        <div className="px-6 py-6">
          <SubmissionAssessment
            groupId={Number(courseId)}
            assignmentId={Number(assignmentId)}
            userId={Number(userId)}
            problemId={Number(problemId)}
            autoGradedScore={0}
          />
        </div>
        <div className="h-3 bg-[#121728]" />

        <div className="px-6 py-2">
          <div className="h-72" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 overflow-auto">
      <div className="z-20 flex items-center gap-3 px-6 pt-6">
        <h1 className="text-xl font-bold">Submission #{submissionData?.id}</h1>
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense
          fallback={
            <div className="flex h-fit flex-col gap-4 px-8 text-lg">
              <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
              <Skeleton className="h-8 w-3/12 rounded-lg bg-slate-900" />
              <Skeleton className="h-32 w-full rounded-lg bg-slate-900" />
            </div>
          }
        >
          <div className="px-6 py-4">
            <SubmissionSummary submission={submissionData} />
          </div>

          <div className="h-3 bg-[#121728]" />

          <div className="px-6 py-2">
            <SubmissionAssessment
              groupId={Number(courseId)}
              assignmentId={Number(assignmentId)}
              userId={Number(userId)}
              problemId={Number(problemId)}
              autoGradedScore={submissionData?.score ?? 0}
            />
          </div>
          <div className="h-3 bg-[#121728]" />

          <div className="px-6 py-2">
            <SubmissionTestcase testResults={testResults} />
          </div>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
