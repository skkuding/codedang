'use client'

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
import { GET_SUBMISSION } from '@/graphql/submission/queries'
import { dateFormatter } from '@/lib/utils'
import type { Language } from '@/types/type'
import { useQuery } from '@apollo/client'

export default function SubmissionDetailAdmin({
  submissionId
}: {
  submissionId: number
}) {
  const { data, loading } = useQuery(GET_SUBMISSION, {
    variables: {
      id: Number(submissionId)
    }
  })
  const submission = data?.getSubmission
  return (
    <ScrollArea className="mt-5 max-h-[540px] w-[580px]">
      {!loading && (
        <div className="ml-20 flex w-[432px] flex-col gap-4">
          <h1 className="flex text-lg font-semibold">
            <span className="max-w-[30%] truncate text-gray-400">
              {submission?.user?.userProfile?.realName}(
              {submission?.user?.studentId})
            </span>
            <span className="max-w-[30%] truncate text-gray-400">
              &nbsp; &gt; &nbsp;{submission?.problem.title}
            </span>
            <span className="max-w-[40%] truncate">
              &nbsp; &gt; &nbsp;Submission #{submissionId}
            </span>
          </h1>
          <h2 className="font-bold">Summary</h2>
          <ScrollArea className="max-w-full shrink-0 rounded-md">
            <div className="flex items-center justify-around gap-5 bg-gray-100 p-5 text-xs [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1 [&_*]:whitespace-nowrap [&_p]:text-slate-400">
              <div>
                <h2>User</h2>
                <p>{submission?.user?.username}</p>
              </div>
              <div>
                <h2>Result</h2>
                <p
                  className={
                    submission?.result === 'Accepted'
                      ? '!text-green-500'
                      : '!text-red-500'
                  }
                >
                  {submission?.result}
                </p>
              </div>
              <div>
                <h2>Language</h2>
                <p>{submission?.language}</p>
              </div>
              <div>
                <h2>Submission Time</h2>
                <p>
                  {dateFormatter(submission?.createTime, 'YYYY-MM-DD HH:mm:ss')}
                </p>
              </div>
              <div>
                <h2>Code Size</h2>
                <p>{new TextEncoder().encode(submission?.code).length} B</p>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          {submission?.testcaseResult.length !== 0 && (
            <div>
              <h2 className="font-bold">Testcase</h2>
              <Table className="[&_*]:text-center [&_*]:text-xs [&_*]:hover:bg-transparent [&_td]:p-2 [&_tr]:!border-neutral-200">
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead className="!text-sm text-black">
                      Result
                    </TableHead>
                    <TableHead className="!text-sm text-black">
                      Runtime
                    </TableHead>
                    <TableHead className="!text-sm text-black">
                      Memory
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-slate-400">
                  {submission?.testcaseResult.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="!py-4">{item.id}</TableCell>
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
                      <TableCell>
                        {(
                          (item?.memoryUsage as number) /
                          (1024 * 1024)
                        ).toFixed(2)}{' '}
                        MB
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div>
            <h2 className="mb-3 font-bold">Source Code</h2>
            <CodeEditor
              value={submission?.code}
              language={submission?.language as Language}
              readOnly
              className="max-h-96 min-h-16 w-full"
            />
          </div>
        </div>
      )}
    </ScrollArea>
  )
}
