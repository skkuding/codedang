import { EditorSkeleton } from '@/app/(client)/(code-editor)/_components/EditorSkeleton'
import { FinishedNoticePanel } from '@/app/(client)/(code-editor)/_components/FinishedNoticePanel'

interface AssignmentFinishedPageProps {
  params: { problemId: string; assignmentId: string; courseId: string }
}

export default function AssignmentFinishedPage({
  params
}: AssignmentFinishedPageProps) {
  const { problemId, assignmentId, courseId } = params

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
