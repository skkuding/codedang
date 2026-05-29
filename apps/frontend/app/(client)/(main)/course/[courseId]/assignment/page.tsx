import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  AssignmentAccordion,
  AssignmentAccordionSkeleton
} from '../_components/AssignmentAccordion'

interface AssignmentProps {
  params: Promise<{ courseId: string }>
}

export default async function Assignment(props: AssignmentProps) {
  const { courseId } = await props.params

  return (
    <div className="mb-12 flex w-full flex-col px-4 pt-10 lg:mt-20 lg:px-6 lg:pt-0">
      <p className="hidden text-2xl font-semibold lg:flex">Assignment</p>

      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<AssignmentAccordionSkeleton />}>
          <AssignmentAccordion courseId={Number(courseId)} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
