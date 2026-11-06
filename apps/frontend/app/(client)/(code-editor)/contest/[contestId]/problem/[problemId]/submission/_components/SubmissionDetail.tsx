'use client'

import { LoadButton } from '@/app/(client)/(code-editor)/_components/LoadButton'
import { useSubmissionDetailSync } from '@/app/(client)/(code-editor)/_components/context/ReFetchingSubmissionDetailStoreProvider'
import { dataIfError } from '@/app/(client)/(code-editor)/_libs/dataIfError'
import { contestSubmissionQueries } from '@/app/(client)/_libs/queries/contestSubmission'
import { CodeEditor } from '@/components/CodeEditor'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { dateFormatter, fetcherWithAuth, getResultColor } from '@/libs/utils'
import type { ContestSubmission, SubmissionDetail } from '@/types/type'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { IoIosLock } from 'react-icons/io'

interface SubmissionDetailProps {
  problemId: number
  submissionId: number
  contestId: number
  refreshTrigger: number
}
export function SubmissionDetail({
  problemId,
  submissionId,
  contestId
}: SubmissionDetailProps) {
  const fetchSubmission = async (
    submissionId: number,
    problemId: number,
    contestId: number
  ): Promise<{ submission: SubmissionDetail } & { isForbidden: boolean }> => {
    const submissionRes = await fetcherWithAuth(`submission/${submissionId}`, {
      searchParams: { problemId, contestId }
    })

    if (!submissionRes.ok && submissionRes.status !== 403) {
      throw new Error(`Failed to Load submission (${submissionRes.status})`)
    }

    return {
      isForbidden: submissionRes.status === 403,
      submission: submissionRes.ok
        ? await submissionRes.json<SubmissionDetail>()
        : dataIfError
    }
  }

  const fetchContestSubmission = async (
    contestId: number,
    problemId: number
  ): Promise<ContestSubmission | null> => {
    const contestSubmissionRes = await fetcherWithAuth(
      `contest/${contestId}/submission`,
      {
        searchParams: { problemId, take: 100 }
      }
    )
    if (!contestSubmissionRes.ok) {
      return null
    }

    return contestSubmissionRes.json<ContestSubmission>()
  }

  const submissionDetailQuery = contestSubmissionQueries.detail({
    contestId,
    submissionId,
    problemId
  }).queryKey

  const { data: submissionDetailData } = useSuspenseQuery({
    queryKey: submissionDetailQuery,
    queryFn: () => fetchSubmission(submissionId, problemId, contestId)
  })

  const { data: contestSubmission } = useSuspenseQuery({
    queryKey: [
      ...contestSubmissionQueries.all({ contestId, problemId }),
      'contest submission'
    ],
    queryFn: () => fetchContestSubmission(contestId, problemId)
  })

  const queryClient = useQueryClient()
  const mounted = useRef(false)
  const refreshTrigger = useSubmissionDetailSync(
    (state) => state.refreshTrigger
  )
  useEffect(() => {
    if (mounted.current) {
      console.log('Detail Refetched')
      queryClient.refetchQueries({
        queryKey: ['submission', 'contest', contestId]
      })
    }
    mounted.current = true
  }, [refreshTrigger, queryClient, contestId, submissionId])

  const { submission, isForbidden } = submissionDetailData

  const targetSubmission = contestSubmission?.data.find(
    (submission) => submission.id === submissionId
  )

  return (
    <>
      <ScrollArea className="shrink-0 rounded-lg px-6">
        <div className="**:whitespace-nowrap flex items-center justify-around gap-3 bg-[#384151] p-5 text-sm [&>div]:flex [&>div]:flex-col [&>div]:items-center [&>div]:gap-1 [&_p]:text-slate-400">
          <div>
            <h2>Result</h2>
            <p className={getResultColor(submission.result)}>
              {submission.result}
            </p>
          </div>
          <div className="h-10 w-px bg-[#616060]" />
          <div>
            <h2>Language</h2>
            <p>{submission.language !== 'Cpp' ? submission.language : 'C++'}</p>
          </div>
          <div className="h-10 w-px bg-[#616060]" />
          <div>
            <h2>Submission Time</h2>
            <p>{dateFormatter(submission.createTime, 'YYYY-MM-DD HH:mm:ss')}</p>
          </div>
          <div className="h-10 w-px bg-[#616060]" />
          <div>
            <h2>Code Size</h2>
            <p>{targetSubmission && targetSubmission.codeSize} B</p>
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="-ml-16 mt-[10px] h-2 min-w-full bg-[#121728]" />
      <div className="my-3 px-6">
        <div className="mb-[18px] flex items-center justify-between">
          <h2 className="text-base font-bold">Source Code</h2>
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

      {isForbidden && (
        <div className="backdrop-blur-xs absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-1">
          <IoIosLock size={100} />
          <p className="mt-4 text-xl font-semibold">Access Denied</p>
          <p className="w-10/12 text-center">
            {`During the contest, you are not allowed to view others' answers.
`}
          </p>
        </div>
      )}
    </>
  )
}
