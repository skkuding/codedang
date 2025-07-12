import { EditorSkeleton } from '@/app/(client)/(code-editor)/_components/EditorSkeleton'
import { FinishedNoticePanel } from '@/app/(client)/(code-editor)/_components/FinishedNoticePanel'

interface ContestFinishedPageProps {
  params: { problemId: string; contestId: string }
}

export default function ContestFinishedPage({
  params
}: ContestFinishedPageProps) {
  const { problemId, contestId } = params

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
