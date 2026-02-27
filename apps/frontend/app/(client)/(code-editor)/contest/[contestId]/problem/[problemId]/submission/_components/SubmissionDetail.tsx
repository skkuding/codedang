'use client'

import { LoadButton } from '@/app/(client)/(code-editor)/_components/LoadButton'
import { dataIfError } from '@/app/(client)/(code-editor)/_libs/dataIfError'
import { CodeEditor } from '@/components/CodeEditor'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { dateFormatter, fetcherWithAuth, getResultColor } from '@/libs/utils'
import { getTranslate } from '@/tolgee/server'
import type { ContestSubmission, SubmissionDetail } from '@/types/type'
import { IoIosLock } from 'react-icons/io'

interface SubmissionDetailProps {
  problemId: number
  submissionId: number
  contestId: number
  refreshTrigger: number
}
export async function SubmissionDetail({
  problemId,
  submissionId,
  contestId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  refreshTrigger // 해당 컴포넌트에서 사용하지 않는 것처럼 보이지만 refresh의 위력을 발휘하는 중입니다. 삭제하지 말아주세요 ㅠㅠ
}: SubmissionDetailProps) {
  const res = await fetcherWithAuth(`submission/${submissionId}`, {
    searchParams: { problemId, contestId }
  })
  const submission: SubmissionDetail = res.ok ? await res.json() : dataIfError

  const contestSubmissionRes = await fetcherWithAuth(
    `contest/${contestId}/submission`,
    {
      searchParams: { problemId, take: 100 }
    }
  )
  const contestSubmission: ContestSubmission | null = contestSubmissionRes.ok
    ? await contestSubmissionRes.json()
    : null
  const targetSubmission = contestSubmission?.data.filter(
    (submission) => submission.id === submissionId
  )[0]

  const t = await getTranslate()

  return (
    <>
      <ScrollArea className="shrink-0 rounded-lg px-6">
        <div className="**:whitespace-nowrap flex items-center justify-around gap-3 bg-[#384151] p-5 text-sm [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1 [&_p]:text-slate-400">
          <div>
            <h2>{t('result_heading')}</h2>
            <p className={getResultColor(submission.result)}>
              {submission.result}
            </p>
          </div>
          <div className="h-10 w-px bg-[#616060]" />
          <div>
            <h2>{t('language_heading')}</h2>
            <p>{submission.language !== 'Cpp' ? submission.language : 'C++'}</p>
          </div>
          <div className="h-10 w-px bg-[#616060]" />
          <div>
            <h2>{t('submission_time_heading')}</h2>
            <p>{dateFormatter(submission.createTime, 'YYYY-MM-DD HH:mm:ss')}</p>
          </div>
          <div className="h-10 w-px bg-[#616060]" />
          <div>
            <h2>{t('code_size_heading')}</h2>
            <p>{targetSubmission && targetSubmission.codeSize} B</p>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="-ml-16 mt-[10px] h-2 min-w-full bg-[#121728]" />
      <div className="my-3 px-6">
        <div className="mb-[18px] flex items-center justify-between">
          <h2 className="text-base font-bold">{t('source_code_heading')}</h2>
          <LoadButton code={submission.code} />
        </div>
        <CodeEditor
          value={submission.code}
          language={submission.language}
          readOnly
          className="max-h-96 min-h-16 w-full rounded-lg"
        />
      </div>
      <div className="-ml-16 h-2 min-w-full bg-[#121728]" />

      {res.ok ? null : (
        <div className="backdrop-blur-xs absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-1">
          <IoIosLock size={100} />
          <p className="mt-4 text-xl font-semibold">
            {t('access_denied_message')}
          </p>
          <p className="w-10/12 text-center">
            {`${t('contest_restriction_notice')}`}
          </p>
        </div>
      )}
    </>
  )
}
