import { EditorSkeleton } from '@/app/(client)/(code-editor)/_components/EditorSkeleton'
import { FinishedNoticePanel } from '@/app/(client)/(code-editor)/_components/FinishedNoticePanel'

interface ContestFinishedPageProps {
  params: Promise<{ problemId: string; contestId: string }>
}

export default async function ContestFinishedPage(
  props: ContestFinishedPageProps
) {
  const { problemId, contestId } = await props.params

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
