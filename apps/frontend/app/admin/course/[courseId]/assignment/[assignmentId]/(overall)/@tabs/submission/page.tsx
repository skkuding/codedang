import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/shadcn/tabs'
import { ErrorBoundary } from '@suspensive/react'
import { useTranslate } from '@tolgee/react'
import { Suspense } from 'react'
import { ParticipantTable } from '../../../../../_components/ParticipantTable'
import {
  SubmissionTable,
  SubmissionTableFallback
} from '../../../../../_components/SubmissionTable'

export default function Submission() {
  const { t } = useTranslate()
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionTableFallback />}>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">{t('all_submissions')}</TabsTrigger>
            <TabsTrigger value="students">{t('students')}</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <SubmissionTable />
          </TabsContent>

          <TabsContent value="students">
            <ParticipantTable />
          </TabsContent>
        </Tabs>
      </Suspense>
    </ErrorBoundary>
  )
}
