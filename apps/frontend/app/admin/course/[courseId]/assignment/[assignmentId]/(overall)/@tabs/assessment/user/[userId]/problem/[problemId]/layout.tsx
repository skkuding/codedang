import { EditorLayout } from '@/app/admin/_components/code-editor/EditorLayout'
import { auth } from '@/libs/auth'
import { Suspense } from 'react'

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
    <Suspense
      fallback={
        <div className="fixed left-0 top-0 grid h-dvh w-full place-items-center bg-slate-800 text-white">
          <div className="text-lg">Loading Editor...</div>
        </div>
      }
    >
      <EditorLayout
        problemId={Number(problemId)}
        courseId={Number(courseId)}
        assignmentId={Number(assignmentId)}
        userId={Number(userId)}
        session={session}
      >
        {children}
      </EditorLayout>
    </Suspense>
  )
}
