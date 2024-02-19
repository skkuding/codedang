import Codeeditor from '@/components/Codeeditor'
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
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function SubmissionDetail({
  params
}: {
  params: {
    problemId: string
    submissionId: string
  }
}) {
  const { submissionId, problemId } = params
  const res = await fetcherWithAuth(`submission/${submissionId}`, {
    searchParams: {
      problemId
    },
    cache: 'no-store'
  })
  if (!res.ok) redirect(`/problem/${problemId}/submission`)

  const submission: SubmissionDetail = await res.json()
  return (
    <div className="flex flex-col gap-5 overflow-auto p-6">
      <div className="flex items-center gap-3 ">
        <Link href={`/problem/${problemId}/submission`}>
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-xl font-bold">Submission #{submissionId}</h1>
      </div>
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
        <Codeeditor
          value={submission.code}
          language={submission.language}
          editable={false}
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
                  <TableCell>{item.cpuTime}</TableCell>
                  <TableCell>{item.memoryUsage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
