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
import { PlusCircleIcon } from 'lucide-react'
import { Suspense, useState } from 'react'
import type { AssignmentProblem } from '../_libs/type'
import {
  ImportProblemTable,
  ImportProblemTableFallback
} from './ImportProblemTable'

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
            className="flex h-[36px] w-48 items-center gap-2 px-0"
          >
            <PlusCircleIcon className="h-4 w-4" />
            <div className="text-sm">Import · Edit problem</div>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="p-8">
          <AlertDialogHeader className="gap-2">
            <AlertDialogTitle>Importing from Problem List</AlertDialogTitle>
            {/* 정책 결정 후 문구 확정 예정 */}
            <AlertDialogDescription>
              If assignment problems are imported from the ‘All Problem List’,
              the problems will automatically become{' '}
              <span className="font-bold">invisible</span> state.
              <br />
              <br />
              These problems will be shared with your course’s instructors.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
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
