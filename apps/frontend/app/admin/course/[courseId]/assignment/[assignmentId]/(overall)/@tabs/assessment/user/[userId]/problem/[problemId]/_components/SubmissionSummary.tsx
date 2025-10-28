import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { dateFormatter } from '@/libs/utils'
import infoIcon from '@/public/icons/info.svg'
import type { SubmissionDetail, TestCaseResult } from '@generated/graphql'
import Image from 'next/image'

interface SubmissionSummaryProps {
  submission:
    | (Pick<SubmissionDetail, 'language' | 'updateTime' | 'codeSize'> & {
        testcaseResult: Omit<TestCaseResult, 'problemTestcase'>[]
      })
    | null
}

export function SubmissionSummary({ submission }: SubmissionSummaryProps) {
  if (!submission) {
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
            <h2>Passed</h2>
            <p>{`${passedTestcases} / ${totalTestcases}`}</p>
          </div>
          <div>
            <h2>Rate</h2>
            <p>{`${passRate}%`}</p>
          </div>
          <div>
            <h2>Language</h2>
            <p>{submission.language}</p>
          </div>
          <div>
            <h2>Submission Time</h2>
            <p>{dateFormatter(submission.updateTime, 'MMM DD, YYYY HH:mm')}</p>
          </div>
          <div>
            <h2>Code Size</h2>
            <p>{submission.codeSize}B</p>
          </div>
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
