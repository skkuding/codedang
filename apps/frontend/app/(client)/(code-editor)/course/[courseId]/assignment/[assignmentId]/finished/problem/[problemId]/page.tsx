import { EditorSkeleton } from '@/app/(client)/(code-editor)/_components/EditorSkeleton'
import { FinishedNoticePanel } from '@/app/(client)/(code-editor)/_components/FinishedNoticePanel'

interface AssignmentFinishedPageProps {
  params: Promise<{ problemId: string; assignmentId: string; courseId: string }>
}

export default async function AssignmentFinishedPage(
  props: AssignmentFinishedPageProps
) {
  const { problemId, assignmentId, courseId } = await props.params

  return (
    <>
      <EditorSkeleton />
      <FinishedNoticePanel
        target={'assignment'}
        problemId={problemId}
        assignmentId={assignmentId}
        courseId={courseId}
      />
    </>
  )
}
