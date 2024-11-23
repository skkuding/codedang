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
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-h-[627px] w-[875px] max-w-[875px] gap-6 overflow-y-auto p-10">
        <DialogHeader>
          <DialogTitle>Are you sure you want to edit this problem?</DialogTitle>
          <DialogDescription className="gap-4 whitespace-pre-line pt-4">
            <ul className="list-decimal space-y-4 pl-4">
              <li className="marker:text-xs marker:font-bold marker:text-black">
                <p className="text-xs font-bold text-black">
                  Editing the problem may affect the{' '}
                  <span className="underline">accuracy</span> of grading
                  results.
                </p>
                <ul className="list-disc py-2 pl-4 text-xs marker:text-gray-500">
                  <li>
                    Future submissions will be graded based on the updated
                    problem.
                  </li>
                  <li>
                    Previous submissions will retain their original grading
                    based on the pre-edit version.
                  </li>
                </ul>
              </li>
              <li className="marker:text-xs marker:font-bold marker:text-black">
                <p className="text-xs font-bold text-black">
                  This problem is part of the following contest.
                </p>{' '}
                <p className="text-xs font-bold text-black">
                  <span className="underline">Please check</span> the contest
                  for which you want to set its{' '}
                  <span className="underline">score to zero(0)</span>.
                </p>
                <ul className="list-disc py-2 pl-4 text-xs marker:text-gray-500">
                  <li>
                    Setting the score to ‘0’ will remove this problem’s impact
                    on grading results.
                  </li>
                </ul>
                <Suspense fallback={<BelongedContestTableFallback />}>
                  <BelongedContestTable
                    problemId={problemId}
                    onSetToZero={(contests) => setZeroSetContests(contests)}
                    onRevertScore={() => setZeroSetContests([])}
                  ></BelongedContestTable>
                </Suspense>
                <div className="my-4 border-b" />
              </li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="filter"
            className="rounded-md px-4 py-2"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await Promise.all(
                zeroSetContests.map((contestId) =>
                  updateContestsProblemsScores({
                    variables: {
                      groupId: 1,
                      contestId: Number(contestId),
                      problemIdsWithScore: [{ problemId, score: 0 }]
                    }
                  })
                )
              )
              onConfirm()
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
