import { ParticipantTable } from '@/app/admin/course/[courseId]/_components/ParticipantTable'
import {
  SubmissionTable,
  SubmissionTableFallback
} from '@/app/admin/course/[courseId]/_components/SubmissionTable'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import {
  Tabs,
  TabsContent,
  TabsTrigger,
  TabsList
} from '@/components/shadcn/tabs'
import { ErrorBoundary } from '@suspensive/react'
import { useTranslate } from '@tolgee/react'
import { Suspense } from 'react'

export default function Submission() {
  const { t } = useTranslate()
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionTableFallback />}>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">{t('all_submissions_button')}</TabsTrigger>
            <TabsTrigger value="students">{t('students_button')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <SubmissionTable isExercise />
          </TabsContent>

          <TabsContent value="students">
            <ParticipantTable isExercise />
          </TabsContent>
        </Tabs>
      </Suspense>
    </ErrorBoundary>
  )
}
