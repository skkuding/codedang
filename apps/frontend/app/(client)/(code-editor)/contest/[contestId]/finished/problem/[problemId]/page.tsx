import { EditorSkeleton } from '@/app/(client)/(code-editor)/_components/EditorSkeleton'
import { FinishedNoticePanel } from '@/app/(client)/(code-editor)/_components/FinishedNoticePanel'
import { getStatusWithStartEnd, safeFetcher } from '@/libs/utils'
import { redirect } from 'next/navigation'

interface ContestFinishedPageProps {
  params: Promise<{ problemId: string; contestId: string }>
}

export default async function ContestFinishedPage(
  props: ContestFinishedPageProps
) {
  const { problemId, contestId } = await props.params
  const contest = await safeFetcher.get(`contest/${contestId}`).json<{
    startTime: string
    endTime: string
  }>()
  const status = getStatusWithStartEnd(contest.startTime, contest.endTime)

  if (status !== 'finished') {
    redirect(`/contest/${contestId}/problem`)
  }

  return (
    <>
      <EditorSkeleton />
      <FinishedNoticePanel
        target={'contest'}
        problemId={problemId}
        contestId={contestId}
      />
    </>
  )
}
