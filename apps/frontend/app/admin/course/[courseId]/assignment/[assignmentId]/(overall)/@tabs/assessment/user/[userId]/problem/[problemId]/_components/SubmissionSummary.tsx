'use client'

import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { GET_ASSIGNMENT_LATEST_SUBMISSION } from '@/graphql/submission/queries'
import { dateFormatter } from '@/libs/utils'
import infoIcon from '@/public/icons/info.svg'
import { useSuspenseQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { useParams } from 'next/navigation'

export function SubmissionSummaryError() {
  const { t } = useTranslate()
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <Image
        src={infoIcon}
        alt={t('no_submission_alt')}
        width={50}
        height={50}
      />
      <p className="text-xl font-medium">{t('no_submission_title')}</p>
      <div className="text-sm font-normal">
        <p>{t('no_code_submitted_by_student')}</p>
        <p>{t('may_provide_final_score_or_comment')}</p>
      </div>
    </div>
  )
}

export function SubmissionSummary() {
  const { t } = useTranslate()
  const params = useParams<{
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }>()
  const { courseId, assignmentId, userId, problemId } = params
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
      <ScrollArea className="shrink-0 rounded-md">
        <div className="**:whitespace-nowrap flex items-center justify-around gap-5 bg-[#384151] p-5 text-sm [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-3 [&_p]:text-[#B0B0B0]">
          <div>
            <h2>{t('passed_label')}</h2>
            <p>{`${passedTestcases} / ${totalTestcases}`}</p>
          </div>
          <div>
            <h2>{t('rate_label')}</h2>
            <p>{`${passRate}%`}</p>
          </div>
          <div>
            <h2>{t('language_label')}</h2>
            <p>{submission.language}</p>
          </div>
          <div>
            <h2>{t('submission_time_label')}</h2>
            <p>{dateFormatter(submission.updateTime, 'MMM DD, YYYY HH:mm')}</p>
          </div>
          <div>
            <h2>{t('code_size_label')}</h2>
            <p>{submission.codeSize}B</p>
          </div>
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
