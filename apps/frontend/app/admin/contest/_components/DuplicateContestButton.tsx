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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { DUPLICATE_CONTEST } from '@/graphql/contest/mutations'
import { GET_CONTESTS } from '@/graphql/contest/queries'
import { getStatusWithStartEnd } from '@/lib/utils'
import { useApolloClient, useMutation } from '@apollo/client'
import { CopyIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useDataTable } from '../../_components/table/context'
import type { DataTableContest } from './ContestTableColumns'

export default function DuplicateContestButton() {
  const { table } = useDataTable<DataTableContest>()

  return table.getSelectedRowModel().rows.length === 1 ? (
    <EnabledDuplicateButton
      contestId={table.getSelectedRowModel().rows[0].original.id}
      contestStatus={getStatusWithStartEnd(
        table.getSelectedRowModel().rows[0].original.startTime,
        table.getSelectedRowModel().rows[0].original.endTime
      )}
      onCompleted={() => {
        table.resetRowSelection()
      }}
    />
  ) : (
    <DisabledDuplicateButton />
  )
}

function DisabledDuplicateButton() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="ml-auto" variant="default" size="default" disabled>
            <CopyIcon className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p> Select only one contest to duplicate</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function EnabledDuplicateButton({
  contestId,
  contestStatus,
  onCompleted
}: {
  contestId: number
  contestStatus: string
  onCompleted?: () => void
}) {
  const client = useApolloClient()
  const [duplicateContest] = useMutation(DUPLICATE_CONTEST)

  const duplicateContestById = async () => {
    const toastId = toast.loading('Duplicating contest...')

    duplicateContest({
      variables: {
        groupId: 1,
        contestId
      },
      onCompleted: (data) => {
        toast.success(
          `Contest duplicated completed.\n Duplicated contest title: ${data.duplicateContest.contest.title}`,
          {
            id: toastId
          }
        )
        onCompleted?.()
        client.refetchQueries({
          include: [GET_CONTESTS]
        })
      },
      onError: (error) => {
        console.log(error)
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="ml-auto" variant="default" size="default">
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
          <AlertDialogCancel className="rounded-md px-4 py-2">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-md bg-blue-500 px-4 py-2 text-white"
            onClick={duplicateContestById}
          >
            Duplicate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
