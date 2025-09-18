import { EditorLayout } from '@/app/(client)/(code-editor)/_components/EditorLayout'

export default async function layout(props: {
  params: Promise<{ problemId: string; assignmentId: string; courseId: string }>
  children: React.ReactNode
}) {
  const { children } = props
  const { problemId, assignmentId, courseId } = await props.params

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
