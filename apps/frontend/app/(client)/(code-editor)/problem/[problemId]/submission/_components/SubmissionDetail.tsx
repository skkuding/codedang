import { LoadButton } from '@/app/(client)/(code-editor)/_components/LoadButton'
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
import { getTranslate } from '@/tolgee/server'
import type { SubmissionDetail } from '@/types/type'
import { revalidateTag } from 'next/cache'

interface Props {
  problemId: number
  submissionId: number
}

export async function SubmissionDetail({ problemId, submissionId }: Props) {
  const res = await fetcherWithAuth(`submission/${submissionId}`, {
    searchParams: { problemId },
    next: {
      tags: [`submission/${submissionId}`]
    }
  })

  const submission: SubmissionDetail = res.ok ? await res.json() : dataIfError

  if (submission.result === 'Judging') {
    revalidateTag(`submission/${submissionId}`)
  }

  const t = await getTranslate()

  return (
    <>
      <ScrollArea className="shrink-0 rounded-md">
        <div className="**:whitespace-nowrap flex items-center justify-around gap-5 bg-slate-700 p-5 text-sm [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1 [&_p]:text-slate-400">
          <div>
            <h2>{t('user_title')}</h2>
            <p>{submission.username}</p>
          </div>
          <div>
            <h2>{t('result_title')}</h2>
            <p className={getResultColor(submission.result)}>
              {submission.result}
            </p>
          </div>
          <div>
            <h2>{t('language_title')}</h2>
            <p>{submission.language}</p>
          </div>
          <div>
            <h2>{t('submission_time_title')}</h2>
            <p>{dateFormatter(submission.createTime, 'MMM DD, YYYY HH:mm')}</p>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t('source_code_title')}</h2>
          <LoadButton code={submission.code} />
        </div>
        <CodeEditor
          value={submission.code}
          language={submission.language}
          readOnly
          className="max-h-96 min-h-16 w-full"
        />
      </div>
      {submission.testcaseResult.length !== 0 && (
        <div>
          <h2 className="text-lg font-bold">{t('test_case_title')}</h2>
          <Table className="**:text-center **:text-sm **:hover:bg-transparent [&_td]:p-2 [&_tr]:border-slate-600">
            <TableHeader className="**:text-slate-100">
              <TableRow>
                <TableHead>{t('header_number')}</TableHead>
                <TableHead>{t('header_result')}</TableHead>
                <TableHead>{t('header_runtime')}</TableHead>
                <TableHead>{t('header_memory')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submission.testcaseResult.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.problemTestcaseId.toString()}</TableCell>
                  <TableCell className={getResultColor(item.result)}>
                    {item.result}
                  </TableCell>
                  <TableCell>{item.cpuTime} ms</TableCell>
                  <TableCell>
                    {(item.memoryUsage / (1024 * 1024)).toFixed(2)} MB
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {res.ok ? null : (
        <div className="backdrop-blur-xs absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-1">
          <p className="mt-4 font-mono text-xl font-semibold">
            {t('access_denied_message')}
          </p>
          <p className="w-10/12 text-center">{t('access_denied_detail')}</p>
        </div>
      )}
    </>
  )
}
