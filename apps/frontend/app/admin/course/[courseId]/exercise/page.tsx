import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import { getTranslate } from '@/tolgee/server'
import { ErrorBoundary } from '@suspensive/react'
import Link from 'next/link'
import { Suspense } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import {
  AssignmentTable,
  AssignmentTableFallback
} from '../../_components/AssignmentTable'

export const dynamic = 'force-dynamic'

export default async function Page(props: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await props.params
  const t = await getTranslate()
  return (
    <div className="container mx-auto space-y-5 py-10">
      <div className="flex justify-between">
        <p className="text-4xl font-bold">{t('exercise_list_title')}</p>
        <Button variant="default" className="w-[120px]" asChild>
          <Link href={`/admin/course/${courseId}/exercise/create` as const}>
            <HiMiniPlusCircle className="mr-2 h-5 w-5" />
            <span className="text-lg">{t('create_button')}</span>
          </Link>
        </Button>
      </div>
      <p className="text-lg text-slate-500">{t('exercise_list_description')}</p>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense fallback={<AssignmentTableFallback />}>
          <AssignmentTable groupId={courseId} isExercise={true} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
