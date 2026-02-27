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
import React from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { FaCircleExclamation } from 'react-icons/fa6'
import type { ContestManagerReviewer } from '../_libs/schemas'

interface DeleteManagerReviewerAlertProps {
  showDeleteDialog: boolean
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>
  setManagers: Dispatch<SetStateAction<ContestManagerReviewer[]>>
  deleteRowId: number | null
}

export function DeleteManagerReviewerAlert({
  showDeleteDialog,
  setShowDeleteDialog,
  setManagers,
  deleteRowId
}: DeleteManagerReviewerAlertProps) {
  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent className="mih-h-[304px] flex w-[432px] flex-col justify-between gap-6 rounded-2xl p-10 shadow-lg sm:rounded-2xl">
        <AlertDialogHeader className="flex flex-col gap-[14px]">
          <AlertDialogTitle>
            <div className="flex flex-col items-center justify-center gap-[24px]">
              <FaCircleExclamation color="#FF3B2F" size={50} />
              <p className="text-head6_m_24">Delete Manager / Reviewer?</p>
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-caption4_r_12">
            If you remove the selected contest manager or reviewer, he/she will
            no longer have access to this contest
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="">
          <AlertDialogCancel className="text-sub4_sb_14 w-full border-[#C4C4C4] text-[#8A8A8A]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={() => {
                setManagers((prev) =>
                  prev.filter((manager) => manager.id !== deleteRowId)
                )
                setShowDeleteDialog(false)
              }}
              className="bg-error text-sub4_sb_14 w-full hover:bg-red-500/90"
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
