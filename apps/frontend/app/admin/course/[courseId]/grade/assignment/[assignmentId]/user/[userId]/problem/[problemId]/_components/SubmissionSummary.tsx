import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { dateFormatter, getResultColor } from '@/libs/utils'
import type { SubmissionDetail } from '@generated/graphql'

interface SubmissionSummaryProps {
  submission: SubmissionDetail
}

export function SubmissionSummary({ submission }: SubmissionSummaryProps) {
  return (
    <ScrollArea className="shrink-0 rounded-md">
      <div className="flex items-center justify-around gap-5 bg-[#384151] p-5 text-sm [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-3 [&_*]:whitespace-nowrap [&_p]:text-[#B0B0B0]">
        <div>
          <h2>User ID</h2>
          <p>{submission.user?.username}</p>
        </div>
        <div>
          <h2>Result</h2>
          <p className={getResultColor(submission.result)}>
            {submission.result}
          </p>
        </div>
        <div>
          <h2>Language</h2>
          <p>{submission.language}</p>
        </div>
        <div>
          <h2>Submission Time</h2>
          <p>{dateFormatter(submission.updateTime, 'YYYY-MM-DD HH:mm:ss')}</p>
        </div>
        <div>
          <h2>Code Size</h2>
          <p>{submission.codeSize}B</p>
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
