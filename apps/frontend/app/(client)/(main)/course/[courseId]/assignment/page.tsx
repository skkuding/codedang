import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { getTranslate } from '@/tolgee/server'
import { ErrorBoundary } from '@suspensive/react'
import { AssignmentAccordion } from '../_components/AssignmentAccordion'

interface AssignmentProps {
  params: Promise<{ courseId: string }>
}

export default async function Assignment(props: AssignmentProps) {
  const { courseId } = await props.params
  const t = await getTranslate()

  return (
    <div className="mb-12 flex w-full flex-col px-4 pt-10 lg:mt-20 lg:px-6 lg:pt-0">
      <p className="hidden text-2xl font-semibold lg:flex">
        {t('assignment_title')}
      </p>

      <ErrorBoundary fallback={FetchErrorFallback}>
        <AssignmentAccordion courseId={Number(courseId)} />
      </ErrorBoundary>
    </div>
  )
}
