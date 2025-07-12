import { EditorSkeleton } from '@/app/(client)/(code-editor)/_components/EditorSkeleton'
import { FinishedNoticePanel } from '@/app/(client)/(code-editor)/_components/FinishedNoticePanel'

interface ExerciseFinishedPageProps {
  params: { problemId: string; exerciseId: string; courseId: string }
}

export default function ExerciseFinishedPage({
  params
}: ExerciseFinishedPageProps) {
  const { problemId, exerciseId, courseId } = params

  return (
    <>
      <EditorSkeleton />
      <FinishedNoticePanel
        target={'exercise'}
        problemId={problemId}
        assignmentId={exerciseId}
        courseId={courseId}
      />
    </>
  )
}
