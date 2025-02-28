import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { dateFormatter, getResultColor } from '@/libs/utils'
import type { SubmissionDetail } from '@generated/graphql'

interface SubmissionDetailPanelProps {
  submission: SubmissionDetail
}

export function SubmissionDetailPanel({
  submission
}: SubmissionDetailPanelProps) {
  return (
    <>
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
      {submission.testcaseResult.length !== 0 && (
        <div>
          <h2 className="text-lg font-bold">Testcase</h2>
          <Table className="[&_*]:text-center [&_*]:text-sm [&_*]:hover:bg-transparent [&_td]:p-2 [&_tr]:border-slate-600">
            <TableHeader className="[&_*]:text-slate-100">
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Runtime</TableHead>
                <TableHead>Memory</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submission.testcaseResult.map((item) => (
                <TableRow className="text-[#9B9B9B]" key={item.id}>
                  <TableCell>{item.problemTestcaseId.toString()}</TableCell>
                  <TableCell>{item.result}</TableCell>
                  <TableCell>
                    {item.cpuTime ? `${item.cpuTime} ms` : '-'}
                  </TableCell>
                  <TableCell>
                    {item.memoryUsage
                      ? `${(item.memoryUsage / (1024 * 1024)).toFixed(2)} MB`
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
