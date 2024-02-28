import CodeEditor from '@/components/CodeEditor'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { fetcherWithAuth } from '@/lib/utils'
import type { SubmissionDetail } from '@/types/type'
import dayjs from 'dayjs'
import { IoIosLock } from 'react-icons/io'

interface Props {
  problemId: number
  submissionId: number
}

export default async function SubmissionDetail({
  problemId,
  submissionId
}: Props) {
  const res = await fetcherWithAuth(`submission/${submissionId}`, {
    searchParams: {
      problemId
    },
    cache: 'no-store'
  })
  const submission: SubmissionDetail = await res.json()

  await new Promise((resolve) => setTimeout(resolve, 10000))

  return res.ok ? (
    <>
      <ScrollArea className="shrink-0 rounded-md">
        <div className="flex items-center justify-around gap-5 bg-slate-700 p-5 text-sm [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1 [&_*]:whitespace-nowrap [&_p]:text-slate-400">
          <div>
            <h2>User</h2>
            <p>{submission.username}</p>
          </div>
          <div>
            <h2>Result</h2>
            <p
              className={
                submission.result === 'Accepted'
                  ? '!text-green-500'
                  : '!text-red-500'
              }
            >
              {submission.result}
            </p>
          </div>
          <div>
            <h2>Language</h2>
            <p>{submission.language}</p>
          </div>
          <div>
            <h2>Submission Time</h2>
            <p>{dayjs(submission.createTime).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div>
        <h2 className="mb-3 text-lg font-bold">Source Code</h2>
        <CodeEditor
          value={submission.code}
          language={submission.language}
          readOnly
          className="max-h-96 min-h-16 w-full"
        />
      </div>
      {submission.testcaseResult.length !== 0 && (
        <div>
          <h2 className="text-lg font-bold">Test case</h2>
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
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell
                    className={
                      item.result === 'Accepted'
                        ? 'text-green-500'
                        : 'text-red-500'
                    }
                  >
                    {item.result}
                  </TableCell>
                  <TableCell>{item.cpuTime} ms</TableCell>
                  <TableCell>{item.memoryUsage} mb</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  ) : (
    <div className="flex h-[300px] flex-col items-center justify-center gap-20">
      <IoIosLock size={100} />
      <p>
        Unable to check others&apos; until your correct submission is accepted
      </p>
    </div>
  )
}
