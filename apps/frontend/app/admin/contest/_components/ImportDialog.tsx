'use client'

import { FetchErrorFallback } from '@/components/FetchErrorFallback'
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
import {
  ImportProblemTable,
  ImportProblemTableFallback
} from '../_components/ImportProblemTable'
import type { ContestProblem } from '../_libs/schemas'

interface ImportDialogProps {
  problems: ContestProblem[]
  setProblems: (problems: ContestProblem[]) => void
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
        <AlertDialogContent className="p-8">
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle>Importing from Problem List</AlertDialogTitle>
            <AlertDialogDescription>
              If contest problems are imported from the ‘All Problem List’, the
              problems will automatically become invisible state.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md px-4 py-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button type="button" onClick={() => setShowImportDialog(true)}>
                Ok
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="w-[1280px] max-w-[1280px]">
          <DialogHeader>
            <DialogTitle>Import Problem</DialogTitle>
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
