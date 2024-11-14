import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  IMPORT_PROBLEMS_TO_CONTEST,
  REMOVE_PROBLEMS_FROM_CONTEST
} from '@/graphql/contest/mutations'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { BelongedContestTable } from './BelongedContestTable'

interface ScoreCautionDialogProps {
  isOpen: boolean
  onClose: () => void
  problemId: number
}

export function ScoreCautionDialog({
  isOpen,
  onClose,
  problemId
}: ScoreCautionDialogProps) {
  const [importProblemsToContest] = useMutation(IMPORT_PROBLEMS_TO_CONTEST)
  const [removeProblemsFromContest] = useMutation(REMOVE_PROBLEMS_FROM_CONTEST)

  const [zeroSetContests, setZeroSetContests] = useState<number[]>([])

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="h-[627px] max-h-[627px] w-[875px] max-w-[875px] gap-6">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to edit this problem?
          </AlertDialogTitle>
          <AlertDialogDescription className="gap-4 whitespace-pre-line">
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
                <BelongedContestTable
                  problemId={problemId}
                  onSetToZero={(contests) => setZeroSetContests(contests)}
                ></BelongedContestTable>
              </li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel
            type="button"
            className="rounded-md px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              zeroSetContests.map(async (contestId) => {
                await removeProblemsFromContest({
                  variables: {
                    groupId: 1,
                    contestId: Number(contestId),
                    problemIds: problemId
                  }
                })
                await importProblemsToContest({
                  variables: {
                    groupId: 1,
                    contestId: Number(contestId),
                    problemIdsWithScore: [{ problemId, score: 0 }]
                  }
                })
              })
              onClose
            }}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
