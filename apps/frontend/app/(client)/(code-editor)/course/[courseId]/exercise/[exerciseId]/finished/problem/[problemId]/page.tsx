import { EditorSkeleton } from '@/app/(client)/(code-editor)/_components/EditorSkeleton'
import { FinishedNoticePanel } from '@/app/(client)/(code-editor)/_components/FinishedNoticePanel'

interface ExerciseFinishedPageProps {
  params: Promise<{ problemId: string; exerciseId: string; courseId: string }>
}

export default async function ExerciseFinishedPage(
  props: ExerciseFinishedPageProps
) {
  const { problemId, exerciseId, courseId } = await props.params

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
