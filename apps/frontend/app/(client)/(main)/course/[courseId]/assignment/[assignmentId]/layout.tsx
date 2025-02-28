import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { AssignmentTabs } from './_components/AssignmentTabs'

interface AssignmentDetailProps {
  params: {
    assignmentId: string
    courseId: string
  }
  tabs: React.ReactNode
}

export default function Layout({ params, tabs }: AssignmentDetailProps) {
  const { assignmentId, courseId } = params

  return (
    <article className="flex flex-col gap-12 p-8">
      <AssignmentTabs assignmentId={assignmentId} courseId={courseId} />
      <ErrorBoundary fallback={FetchErrorFallback}>{tabs}</ErrorBoundary>
    </article>
  )
}
