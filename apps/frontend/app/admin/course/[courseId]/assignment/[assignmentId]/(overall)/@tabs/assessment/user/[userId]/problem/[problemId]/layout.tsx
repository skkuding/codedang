import { EditorLayout } from '@/app/admin/_components/code-editor/EditorLayout'
import { auth } from '@/libs/auth'
import React from 'react'

export default async function Layout({
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
      {React.Children.toArray(children)}
    </EditorLayout>
  )
}
