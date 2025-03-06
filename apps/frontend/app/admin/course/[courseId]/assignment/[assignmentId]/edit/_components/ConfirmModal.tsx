import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'

interface ModalProps {
  open: boolean
  handleClose: () => void
  confirmAction: () => void
  deletedProblemTitles: string[]
  scoreUpdatedProblemTitles: string[]
}

export function ConfirmModal({
  open,
  handleClose,
  confirmAction,
  deletedProblemTitles,
  scoreUpdatedProblemTitles
}: ModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="w-[416px] p-10">
        <AlertDialogHeader>
          <AlertDialogTitle />
          <div className="text-center text-xl font-medium">
            <p>Are you sure to change the score</p>
            <p>or remove these problems?</p>
          </div>
          <AlertDialogDescription />
        </AlertDialogHeader>
        <div className="my-4 rounded-[10px] bg-[#FAFAFA] p-8">
          <ul className="flex list-inside list-disc flex-col gap-2 text-sm font-normal text-[#737373]">
            {deletedProblemTitles.map((problemTitle) => (
              <li key={problemTitle}>{problemTitle} (Deleted)</li>
            ))}
            {scoreUpdatedProblemTitles.map((problemTitle) => (
              <li key={problemTitle}>{problemTitle} (Score revised)</li>
            ))}
          </ul>
        </div>
        <div className="text-[13px] font-normal text-[#737373]">
          <p>If the problems is changed,</p>
          <p>the submissions of these assignment problem will be lost.</p>
          <p>If these problems,</p>
          <p>The score of existing submissions could be not consistent</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex h-[44px] w-[166px] items-center justify-center"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={confirmAction}
              className="flex h-[44px] w-[166px] items-center justify-center bg-[#FF3B2F] hover:bg-red-500"
            >
              Confirm
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
