import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { AssignmentAccordion } from '../_components/AssignmentAccordion'

interface AssignmentProps {
  params: { courseId: string }
}

export default function Assignment({ params }: AssignmentProps) {
  const { courseId } = params

  return (
    <div className="mb-12 mt-20 flex w-full flex-col px-6">
      <p className="text-2xl font-semibold">Assignment</p>

      <ErrorBoundary fallback={FetchErrorFallback}>
        <AssignmentAccordion courseId={courseId} />
      </ErrorBoundary>
    </div>
  )
}
