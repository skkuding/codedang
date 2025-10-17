import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Modal } from '@/components/Modal'
import { REJUDGE_ASSIGNMENT_PROBLEM } from '@/graphql/submission/mutations'
import { useMutation } from '@apollo/client'
import { RejudgeMode } from '@generated/graphql'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, useCallback, useState } from 'react'
import {
  BelongedContestTable,
  BelongedContestTableFallback
} from './BelongedContestTable'
import type { BelongedContest } from './BelongedContestTableColumns'

interface ScoreCautionDialogProps {
  isOpen: boolean
  onCancel: () => void
  onConfirm: () => void
  problemId: number
}

export function ScoreCautionDialog({
  isOpen,
  onCancel,
  onConfirm,
  problemId
}: ScoreCautionDialogProps) {
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
      title={'Are you sure you want to edit this problem?'}
      open={isOpen}
      onOpenChange={onCancel}
      primaryButton={{
        text: isUpdating ? 'Updating...' : 'Confirm',
        variant: 'default',
        onClick: async () => {
          setIsUpdating(true)

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
              await onConfirm()
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
            Editing the problem may affect the{' '}
            <span className="underline">accuracy</span> of grading results.
          </p>
          <ul className="list-disc py-2 pl-4 text-xs marker:text-gray-500">
            <li>
              Future submissions will be graded based on the updated problem.
            </li>
            <li>
              Previous submissions will retain their original grading based on
              the pre-edit version.
            </li>
          </ul>
        </li>
        <li className="marker:text-xs marker:font-bold marker:text-black">
          <p className="text-xs font-bold text-black">
            This problem is included in the following assignments.
          </p>{' '}
          <p className="text-xs font-bold text-black">
            <span className="underline">Please select</span> the assignments for
            which you want to{' '}
            <span className="underline">rejudge submissions</span> after editing
            the problem.
          </p>
          <ul className="list-disc py-2 pl-4 text-xs marker:text-gray-500">
            <li>
              Re-evaluate all submissions for this problem in the selected
              assignments.
            </li>
            <li>
              This ensures that submissions are graded based on the updated
              problem.
            </li>
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
