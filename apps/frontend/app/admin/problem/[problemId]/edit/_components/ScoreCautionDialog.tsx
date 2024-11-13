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
          <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
