'use client'

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
import { DUPLICATE_CONTEST } from '@/graphql/contest/mutations'
import { useMutation } from '@apollo/client'
import { CopyIcon } from 'lucide-react'

export default function DuplicateContest({
  groupId,
  contestId,
  contestStatus
}: {
  groupId: number
  contestId: number
  contestStatus: string
}) {
  const [duplicateContest, { error }] = useMutation(DUPLICATE_CONTEST)

  const duplicateContestById = async () => {
    if (error) {
      console.error(error)
      return
    }

    const res = await duplicateContest({
      variables: {
        groupId,
        contestId
      }
    })

    if (res.data) {
      console.log('Duplicated contest info:', res.data)
    }
  }

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="default" size="default">
            <CopyIcon className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="border-slate-80 border bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-black">
              Duplicate {contestStatus === 'ongoing' ? 'Ongoing ' : ''}Contest
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500">
              <p className="font-semibold">Contents That Will Be Copied:</p>
              <ul className="mb-3 ml-5 list-disc">
                <li>Title</li>
                <li>Start Time & End Time</li>
                <li>Description</li>
                <li>
                  Contest Security Settings (invitation code, allow copy/paste)
                </li>
                <li>Contest Problems</li>
                <li className="text-red-500">
                  Participants of the selected contest <br />
                  <span className="text-xs">
                    (All participants of the selected contest will be
                    automatically registered for the duplicated contest.)
                  </span>
                </li>
              </ul>
              <p className="font-semibold">Contents That Will Not Be Copied:</p>
              <ul className="mb-3 ml-5 list-disc">
                <li>Users&apos; Submissions</li>
              </ul>
              {contestStatus === 'ongoing' ? (
                <p className="mb-3 mt-4 text-red-500">
                  Caution: The new contest will be set to visible.
                </p>
              ) : (
                <p className="mb-3 mt-4 text-red-500">
                  Caution: The new contest will be set to invisible
                </p>
              )}
              <p className="mt-4">
                Are you sure you want to proceed with duplicating the selected
                contest?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2">
            <AlertDialogCancel className="rounded-md bg-gray-500 px-4 py-2 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-md bg-blue-600 px-4 py-2 text-white"
              onClick={duplicateContestById}
            >
              Duplicate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
