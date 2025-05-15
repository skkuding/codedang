'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, useState } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import type { AssignmentProblem } from '../_libs/type'
import {
  ImportProblemTable,
  ImportProblemTableFallback
} from '../assignment/_components/ImportProblemTable'

interface ImportDialogProps {
  problems: AssignmentProblem[]
  setProblems: (problems: AssignmentProblem[]) => void
}

export function ImportDialog({ problems, setProblems }: ImportDialogProps) {
  const [showImportDialog, setShowImportDialog] = useState(false)
  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            className="flex h-[36px] w-40 items-center gap-1 px-0"
          >
            <HiMiniPlusCircle className="h-5 w-5" />
            <div className="text-sm font-bold">Import problem</div>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="h-[248px] w-[424px] gap-6 p-10 pt-11 sm:rounded-2xl">
          <AlertDialogHeader className="items-center justify-center gap-3">
            <AlertDialogTitle className="text-2xl font-semibold">
              Importing from Problem List
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500">
              If assignment problems are imported from the ‘All Problem List’,
              the problems will automatically become invisible state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full gap-0">
            <AlertDialogCancel className="w-1/2 rounded-full border-[#C4C4C4] px-4 py-2 text-[#8A8A8A]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="w-1/2" asChild>
              <Button
                type="button"
                className="ml-0 rounded-full"
                onClick={() => setShowImportDialog(true)}
              >
                OK
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-h-[766px] max-w-[824px] px-[42px] py-[70px]">
          <DialogHeader className="justify-center">
            <DialogTitle className="text-2xl">
              Import / Edit Problem
            </DialogTitle>
          </DialogHeader>
          <ErrorBoundary fallback={FetchErrorFallback}>
            <Suspense fallback={<ImportProblemTableFallback />}>
              <ImportProblemTable
                checkedProblems={problems}
                onSelectedExport={(problems) => {
                  setProblems(problems)
                  setShowImportDialog(false)
                }}
              />
            </Suspense>
          </ErrorBoundary>
        </DialogContent>
      </Dialog>
    </>
  )
}
