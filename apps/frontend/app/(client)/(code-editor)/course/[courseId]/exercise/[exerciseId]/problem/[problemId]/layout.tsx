import { EditorLayout } from '@/app/(client)/(code-editor)/_components/EditorLayout'

export default function layout({
  params,
  children
}: {
  params: { problemId: string; exerciseId: string; courseId: string }
  children: React.ReactNode
}) {
  const { problemId, exerciseId, courseId } = params

  return (
    <EditorLayout
      problemId={Number(problemId)}
      exerciseId={Number(exerciseId)}
      courseId={Number(courseId)}
    >
      {children}
    </EditorLayout>
  )
}
