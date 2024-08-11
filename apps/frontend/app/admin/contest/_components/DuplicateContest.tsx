import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import CopyIcon from '@/public/icons/copy.svg'
import Image from 'next/image'

export default function DuplicateContest({
  isContestOngoing
}: {
  isContestOngoing: boolean
}) {
  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="icon"
            className="size-7 w-[77px] shrink-0 gap-[5px] rounded-md bg-slate-600 font-normal text-red-500 hover:bg-slate-700"
          >
            <Image src={CopyIcon} alt="Copy" width={24} />
            Duplicate
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border border-slate-800 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-50">
              Duplicate {isContestOngoing ? 'Ongoing ' : ''}Contest
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              <p>Contents That Will Be Copied:</p>
              <ul>
                <li>Title</li>
                <li>Start Time & End Time</li>
                <li>Description</li>
                <li>
                  Contest Security Settings (invitation code, allow copy/paste)
                </li>
                <li>Contest Problems</li>
                <li className="text-red-500">
                  Participants of the selected contest (All participants of the
                  selected contest will be automatically registered for the
                  duplicated contest.)
                </li>
              </ul>
              <p>Contents That Will Not Be Copied:</p>
              <ul>
                <li>Users&quot; Submissions</li>
              </ul>
              {isContestOngoing && (
                <p className="text-red-500">
                  Caution: The new contest will be set to visible. Are you sure
                  you want to proceed with duplicating the selected contest?
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => console.log('Duplicating contest...')}
            >
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
