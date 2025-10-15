import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
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
                  This problem is included in the following assignments.
                </p>{' '}
                <p className="text-xs font-bold text-black">
                  <span className="underline">Please select</span> the
                  assignments for which you want to{' '}
                  <span className="underline">rejudge submissions</span> after
                  editing the problem.
                </p>
                <ul className="list-disc py-2 pl-4 text-xs marker:text-gray-500">
                  <li>
                    Re-evaluate all submissions for this problem in the selected
                    assignments.
                  </li>
                  <li>
                    This ensures that submissions are graded based on the
                    updated problem.
                  </li>
                </ul>
                <ErrorBoundary fallback={FetchErrorFallback}>
                  <Suspense fallback={<BelongedContestTableFallback />}>
                    <BelongedContestTable
                      problemId={problemId}
                      onSelectedAssignmentsChange={
                        handleSelectedAssignmentsChange
                      }
                    />
                  </Suspense>
                </ErrorBoundary>
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
              onConfirm()

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
                }
              }
            }}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
