import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { AssignmentAccordion } from '../_components/AssignmentAccordion'

interface AssignmentProps {
  params: Promise<{ courseId: string }>
}

export default async function Assignment(props: AssignmentProps) {
  const { courseId } = await props.params

  return (
    <div className="mb-12 mt-20 flex w-full flex-col px-6">
      <p className="text-2xl font-semibold">Assignment</p>

      <ErrorBoundary fallback={FetchErrorFallback}>
        <AssignmentAccordion courseId={Number(courseId)} />
      </ErrorBoundary>
    </div>
  )
}
