'use client'

import { LevelBadge } from '@/components/LevelBadge'
import { GET_ASSIGNMENT_PROBLEMS } from '@/graphql/problem/queries'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import { dateFormatter, getResultColor } from '@/libs/utils'
import infoIcon from '@/public/icons/info.svg'
import type { Level } from '@/types/type'
import { useSuspenseQuery } from '@apollo/client'
import Image from 'next/image'
import { useParams } from 'next/navigation'

export function SubmissionSummaryError() {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <Image src={infoIcon} alt="No Submission" width={50} height={50} />
      <p className="text-xl font-medium">No Submission</p>
      <div className="text-sm font-normal">
        <p>No code has been submitted by this student.</p>
        <p>You may still provide a final score or comment.</p>
      </div>
    </div>
  )
}

export function SubmissionSummary() {
  const params = useParams<{
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }>()
  const { courseId, assignmentId, userId, problemId } = params
  const assignmentProblems =
    useSuspenseQuery(GET_ASSIGNMENT_PROBLEMS, {
      variables: {
        groupId: Number(courseId),
        assignmentId: Number(assignmentId)
      },
      fetchPolicy: 'cache-first'
    }).data?.getAssignmentProblems ?? []

  const currentProblem = assignmentProblems.find(
    (p) => p.problemId === Number(problemId)
  )

  const level = currentProblem?.problem.difficulty as Level | undefined

  const submission = useSuspenseQuery(GET_ASSIGNMENT_LATEST_SUBMISSION, {
    variables: {
      groupId: Number(courseId),
      assignmentId: Number(assignmentId),
      userId: Number(userId),
      problemId: Number(problemId)
    }
  }).data.getAssignmentLatestSubmission

  const totalTestcases = submission.testcaseResult.length
  const passedTestcases = submission.testcaseResult.filter(
    (tc) => tc.result === 'Accepted'
  ).length
  const passRate =
    totalTestcases > 0
      ? ((passedTestcases / totalTestcases) * 100).toFixed(1)
      : '0.0'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[20px] font-semibold text-white">
          {`Submission #${submission.id}`}
        </p>
        {level && (
          <LevelBadge
            type="dark"
            level={level}
            className="w-[60px] rounded-[4px] bg-[#282D3D]"
          />
        )}
      </div>
      <div className="**:whitespace-nowrap rounded-[4px] bg-[#282D3D] text-[14px]">
        <ul className="gap-2 space-y-3 py-3 pl-2 pr-4">
          <li className="relative pl-5">
            <span className="absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center before:block before:h-1 before:w-1 before:rounded-full before:bg-white" />
            <div className="flex items-center justify-between">
              <p className="text-white">Result</p>
              <p className={getResultColor(submission.result)}>
                {submission.result}
              </p>
            </div>
          </li>
          <li className="relative pl-5">
            <span className="absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center before:block before:h-1 before:w-1 before:rounded-full before:bg-white" />
            <div className="flex items-center justify-between">
              <p className="text-white">Passed</p>
              <p className="text-primary-light">{`${passedTestcases} / ${totalTestcases}`}</p>
            </div>
          </li>

          <li className="relative pl-5">
            <span className="absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center before:block before:h-1 before:w-1 before:rounded-full before:bg-white" />
            <div className="flex items-center justify-between">
              <h2 className="text-white">Rate</h2>
              <p className="text-primary-light">{`${passRate}%`}</p>
            </div>
          </li>

          <li className="relative pl-5">
            <span className="absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center before:block before:h-1 before:w-1 before:rounded-full before:bg-white" />
            <div className="flex items-center justify-between">
              <h2 className="text-white">Language</h2>
              <p className="text-primary-light">{submission.language}</p>
            </div>
          </li>

          <li className="relative pl-5">
            <span className="absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center before:block before:h-1 before:w-1 before:rounded-full before:bg-white" />
            <div className="flex items-center justify-between">
              <h2 className="text-white">Submission Time</h2>
              <p className="text-primary-light">
                {dateFormatter(
                  submission.updateTime,
                  'YYYY. MM. DD | YYYY. MM. DD'
                )}
              </p>
            </div>
          </li>

          <li className="relative pl-5">
            <span className="absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center before:block before:h-1 before:w-1 before:rounded-full before:bg-white" />
            <div className="flex items-center justify-between">
              <h2 className="text-white">Code Size</h2>
              <p className="text-primary-light">{submission.codeSize}B</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
