import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Modal } from '@/components/Modal'
import { REJUDGE_ASSIGNMENT_PROBLEM } from '@/graphql/submission/mutations'
import { useMutation } from '@apollo/client'
import { RejudgeMode } from '@generated/graphql'
import { ErrorBoundary } from '@suspensive/react'
import { useTranslate } from '@tolgee/react'
import { Suspense, useCallback, useState } from 'react'
import {
  BelongedContestTable,
  BelongedContestTableFallback
} from './BelongedContestTable'
import type { BelongedContest } from './BelongedContestTableColumns'

interface ScoreCautionDialogProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => Promise<void>
  problemId: number
}

export function ScoreCautionDialog({
  isOpen,
  onCancel,
  onConfirm,
  problemId
}: ScoreCautionDialogProps) {
  const { t } = useTranslate()
  const [rejudge] = useMutation(REJUDGE_ASSIGNMENT_PROBLEM)
  const [isUpdating, setIsUpdating] = useState(false)

  const [selectedAssignments, setSelectedAssignments] = useState<
    BelongedContest[]
  >([])

  const handleSelectedAssignmentsChange = useCallback(
    (assignments: BelongedContest[]) => {
      setSelectedAssignments(assignments)
    },
    []
  )

  return (
    <Modal
      size={'lg'}
      type={'custom'}
      title={t('edit_problem_confirmation_title')}
      open={isOpen}
      onOpenChange={onCancel}
      primaryButton={{
        text: isUpdating ? t('updating_status') : t('confirm_button'),
        variant: 'default',
        onClick: async () => {
          setIsUpdating(true)
          await onConfirm()

          if (selectedAssignments.length > 0) {
            try {
              for (const assignment of selectedAssignments) {
                await rejudge({
                  variables: {
                    groupId: assignment.groupId,
                    input: {
                      assignmentId: assignment.id,
                      problemId,
                      mode: RejudgeMode.CreateNew
                    }
                  }
                })
              }
            } catch (e) {
              console.error('재채점 실패:', e)
            } finally {
              setIsUpdating(false)
            }
          }
        },
        disabled: isUpdating
      }}
    >
      <ul className="list-decimal space-y-4 pl-4">
        <li className="marker:text-xs marker:font-bold marker:text-black">
          <p className="text-xs font-bold text-black">
            {t('edit_problem_may_affect_grading')}
            <span className="underline">{t('accuracy')}</span>{' '}
            {t('of_grading_results')}
          </p>
          <ul className="list-disc py-2 pl-4 text-xs marker:text-gray-500">
            <li>{t('future_submissions_based_on_updated_problem')}</li>
            <li>{t('previous_submissions_retain_original_grading')}</li>
          </ul>
        </li>
        <li className="marker:text-xs marker:font-bold marker:text-black">
          <p className="text-xs font-bold text-black">
            {t('problem_included_in_following_assignments')}
          </p>
          <p className="text-xs font-bold text-black">
            <span className="underline">{t('please_select')}</span>{' '}
            {t('assignments_for_rejudge')}
            <span className="underline">{t('rejudge_submissions')}</span>{' '}
            {t('after_editing_problem')}
          </p>
          <ul className="list-disc py-2 pl-4 text-xs marker:text-gray-500">
            <li>{t('re_evaluate_submissions_in_selected_assignments')}</li>
            <li>{t('ensure_submissions_graded_based_on_updated_problem')}</li>
          </ul>
          <ErrorBoundary fallback={FetchErrorFallback}>
            <Suspense fallback={<BelongedContestTableFallback />}>
              <BelongedContestTable
                problemId={problemId}
                onSelectedAssignmentsChange={handleSelectedAssignmentsChange}
              />
            </Suspense>
          </ErrorBoundary>
        </li>
      </ul>
    </Modal>
  )
}
