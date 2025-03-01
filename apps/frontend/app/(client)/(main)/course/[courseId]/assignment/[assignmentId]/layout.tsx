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
    <article className="flex flex-col gap-20 px-8 py-20">
      <div className="flex justify-center">
        <AssignmentTabs assignmentId={assignmentId} courseId={courseId} />
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>{tabs}</ErrorBoundary>
    </article>
  )
}
