'use client'

import { EditorLayout } from '@/app/admin/course/[courseId]/grade/assignment/[assignmentId]/user/[userId]/problem/[problemId]/_components/EditorLayout'

export default function layout({
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

  return (
    <EditorLayout
      problemId={Number(problemId)}
      courseId={Number(courseId)}
      assignmentId={Number(assignmentId)}
      userId={Number(userId)}
    >
      {children}
    </EditorLayout>
  )
}
