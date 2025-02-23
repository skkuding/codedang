import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { auth } from '@/libs/auth'
import { fetcher, fetcherWithAuth } from '@/libs/utils'
import { ErrorBoundary } from '@suspensive/react'
import { AssignmentTabs } from './_components/AssignmentTabs'

interface AssignmentDetailProps {
  params: {
    assignmentId: string
    courseId: string
  }
  tabs: React.ReactNode
}

export default async function Layout({ params, tabs }: AssignmentDetailProps) {
  const { assignmentId, courseId } = params
  const session = await auth()

  const res = await (session ? fetcherWithAuth : fetcher).head(
    `assignment/${assignmentId}`
  )

  if (res.ok) {
    return (
      <article className="flex flex-col gap-12 p-8">
        <AssignmentTabs assignmentId={assignmentId} courseId={courseId} />
        <ErrorBoundary fallback={FetchErrorFallback}>{tabs}</ErrorBoundary>
      </article>
    )
  }

  return <p className="text-center">No Results.</p>
}
