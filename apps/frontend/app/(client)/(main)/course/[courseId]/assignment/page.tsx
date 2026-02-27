import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { AssignmentAccordion } from '../_components/AssignmentAccordion'

interface AssignmentProps {
  params: Promise<{ courseId: string }>
}

export default async function Assignment(props: AssignmentProps) {
  const { courseId } = await props.params

  return (
    <div className="mb-12 flex w-full flex-col px-4 pt-10 lg:mt-20 lg:px-6 lg:pt-0">
      <p className="text-head5_sb_24 hidden lg:flex">Assignment</p>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <AssignmentAccordion courseId={Number(courseId)} />
      </ErrorBoundary>
    </div>
  )
}
