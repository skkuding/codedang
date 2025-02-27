import { EditorLayout } from '@/app/(client)/(code-editor)/_components/EditorLayout'

export default function layout({
  params,
  children
}: {
  params: { problemId: string; assignmentId: string; courseId: string }
  children: React.ReactNode
}) {
  const { problemId, assignmentId, courseId } = params

  return (
    <EditorLayout
      problemId={Number(problemId)}
      assignmentId={Number(assignmentId)}
      courseId={Number(courseId)}
    >
      {children}
    </EditorLayout>
  )
}
