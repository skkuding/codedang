import { dataIfError } from '@/app/(client)/(code-editor)/_libs/dataIfError'
import { CodeEditor } from '@/components/CodeEditor'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/shadcn/table'
import { dateFormatter, fetcherWithAuth, getResultColor } from '@/libs/utils'
import type { ContestSubmission, SubmissionDetail } from '@/types/type'
import { revalidateTag } from 'next/cache'
import { IoIosLock } from 'react-icons/io'

interface Props {
  problemId: number
  submissionId: number
  exerciseId: number
}

export async function SubmissionDetail({
  problemId,
  submissionId,
  exerciseId
}: Props) {
  const res = await fetcherWithAuth(`submission/${submissionId}`, {
    searchParams: { problemId, assignmentId: exerciseId },
    next: {
      tags: [`submission/${submissionId}`]
    }
  })
  const submission: SubmissionDetail = res.ok ? await res.json() : dataIfError
  const assignmentSubmissionRes = await fetcherWithAuth(
    `assignment/${exerciseId}/submission`,
    {
      searchParams: { problemId, take: 100 }
    }
  )
  const assignmentSubmission: ContestSubmission | null =
    assignmentSubmissionRes.ok ? await assignmentSubmissionRes.json() : null
  const targetSubmission = assignmentSubmission?.data.filter(
    (submission) => submission.id === submissionId
  )[0]

  if (submission.result === 'Judging') {
    revalidateTag(`submission/${submissionId}`)
  }
  let sampleCount = 1
  let hiddenCount = 1

  return (
    <>
      <ScrollArea className="shrink-0 rounded-lg px-6">
        <div className="flex items-center justify-around gap-3 bg-[#384151] p-5 text-sm [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1 [&_*]:whitespace-nowrap [&_p]:text-slate-400">
          <div>
            <h2>Language</h2>
            <p>{submission.language !== 'Cpp' ? submission.language : 'C++'}</p>
          </div>
          <div className="h-10 w-[1px] bg-[#616060]" />
          <div>
            <h2>Submission Time</h2>
            <p>{dateFormatter(submission.createTime, 'MMM DD, YYYY HH:mm')}</p>
          </div>
          <div className="h-10 w-[1px] bg-[#616060]" />
          <div>
            <h2>Code Size</h2>
            <p>{targetSubmission && targetSubmission.codeSize} B</p>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="-ml-16 mt-[10px] h-2 min-w-[100%] bg-[#121728]" />
      <div className="my-3 px-6">
        <h2 className="mb-[18px] text-base font-bold">Source Code</h2>
        <CodeEditor
          value={submission.code}
          language={submission.language}
          readOnly
          className="max-h-96 min-h-16 w-full rounded-lg"
        />
      </div>
      <div className="-ml-16 h-2 min-w-[100%] bg-[#121728]" />
      {submission.testcaseResult.length !== 0 && (
        <div className="my-3 px-6">
          <h2 className="mb-[18px] text-base font-bold">Test case</h2>
          <Table className="[&_*]:text-center [&_*]:text-sm [&_*]:hover:bg-transparent [&_td]:p-2 [&_tr]:border-slate-600">
            <TableHeader className="[&_*]:text-slate-100">
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Runtime</TableHead>
                <TableHead>Memory</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-[#B0B0B0]">
              {[...submission.testcaseResult]
                .sort((a, b) => {
                  const aHidden = a.problemTestcase?.isHidden ?? true
                  const bHidden = b.problemTestcase?.isHidden ?? true
                  return Number(aHidden) - Number(bHidden)
                })
                .map((item) => {
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.problemTestcase?.isHidden
                          ? `Hidden #${(hiddenCount++).toString().padStart(2, '0')}`
                          : `Sample #${(sampleCount++).toString().padStart(2, '0')}`}
                      </TableCell>
                      <TableCell
                        className={
                          submission.result === 'Blind'
                            ? 'text-neutral-400'
                            : getResultColor(item.result)
                        }
                      >
                        {item.result}
                      </TableCell>
                      <TableCell>{item.cpuTime} ms</TableCell>
                      <TableCell>
                        {(item.memoryUsage / (1024 * 1024)).toFixed(2)} MB
                      </TableCell>
                    </TableRow>
                  )
                })}
            </TableBody>
          </Table>
        </div>
      )}
      {res.ok ? null : (
        <div className="absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-1 backdrop-blur">
          <IoIosLock size={100} />
          <p className="mt-4 text-xl font-semibold">Access Denied</p>
          <p className="w-10/12 text-center">
            {`During the assignment, you are not allowed to view others' answers.
`}
          </p>
        </div>
      )}
    </>
  )
}
