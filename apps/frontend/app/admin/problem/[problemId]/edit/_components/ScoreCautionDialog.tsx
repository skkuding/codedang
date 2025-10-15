import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { UPDATE_CONTEST_PROBLEMS_SCORES } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, useState } from 'react'
import {
  BelongedContestTable,
  BelongedContestTableFallback
} from './BelongedContestTable'

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
  const [updateContestsProblemsScores] = useMutation(
    UPDATE_CONTEST_PROBLEMS_SCORES
  )

  const [zeroSetContests, setZeroSetContests] = useState<number[]>([])

  return (
    <Modal
      size={'lg'}
      type={'custom'}
      title={'Are you sure you want to edit this problem?'}
      open={isOpen}
      onOpenChange={onCancel}
      primaryButton={{
        text: 'Confirm',
        onClick: async () => {
          await Promise.all(
            zeroSetContests.map((contestId) =>
              updateContestsProblemsScores({
                variables: {
                  contestId: Number(contestId),
                  problemIdsWithScore: [{ problemId, score: 0 }]
                }
              })
            )
          )
          onConfirm()
        }
      }}
      secondaryButton={{
        text: 'Cancel',
        onClick: onCancel,
        variant: 'outline'
      }}
    >
      <div>
        <ul className="list-decimal space-y-4">
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
              This problem is part of the following contest.
            </p>{' '}
            <p className="text-xs font-bold text-black">
              <span className="underline">Please check</span> the contest for
              which you want to set its{' '}
              <span className="underline">score to zero(0)</span>.
            </p>
            <ul className="list-disc py-2 pl-4 text-xs marker:text-gray-500">
              <li>
                Setting the score to ‘0’ will remove this problem’s impact on
                grading results.
              </li>
            </ul>
          </li>
        </ul>
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<BelongedContestTableFallback />}>
            <BelongedContestTable
              problemId={problemId}
              onSetToZero={(contests) => setZeroSetContests(contests)}
              onRevertScore={() => setZeroSetContests([])}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Modal>
  )
}
