import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { ExerciseAccordion } from '../_components/ExerciseAccordion'

interface ExerciseProps {
  params: Promise<{ courseId: string }>
}

export default async function Exercise(props: ExerciseProps) {
  const { courseId } = await props.params

  return (
    <div className="mb-12 mt-20 flex w-full flex-col px-6">
      <p className="text-2xl font-semibold">Exercise</p>

      <ErrorBoundary fallback={FetchErrorFallback}>
        <ExerciseAccordion courseId={Number(courseId)} />
      </ErrorBoundary>
    </div>
  )
}
