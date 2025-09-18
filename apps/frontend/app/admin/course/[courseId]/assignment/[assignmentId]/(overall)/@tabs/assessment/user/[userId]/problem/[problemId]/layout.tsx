import { EditorLayout } from '@/app/admin/_components/code-editor/EditorLayout'
import { auth } from '@/libs/auth'

export default async function layout(props: {
  params: Promise<{
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }>
  children: React.ReactNode
}) {
  const { children } = props
  const { courseId, assignmentId, userId, problemId } = await props.params
  const session = await auth()

  return (
    <EditorLayout
      problemId={Number(problemId)}
      courseId={Number(courseId)}
      assignmentId={Number(assignmentId)}
      userId={Number(userId)}
      session={session}
    >
      {children}
    </EditorLayout>
  )
}
