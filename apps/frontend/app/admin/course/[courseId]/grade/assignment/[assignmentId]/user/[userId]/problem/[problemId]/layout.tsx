import { EditorLayout } from '@/app/admin/course/[courseId]/grade/assignment/[assignmentId]/user/[userId]/problem/[problemId]/_components/EditorLayout'
import { auth } from '@/libs/auth'

export default async function layout({
  params,
  children
}: {
  params: {
    courseId: string
    assignmentId: string
    userId: string
    problemId: string
  }
  children: React.ReactNode
}) {
  const { courseId, assignmentId, userId, problemId } = params

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
