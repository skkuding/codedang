'use client'

import { AlertModal } from '@/components/AlertModal'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, useState } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import type { AssignmentProblem } from '../_libs/type'
import {
  ImportProblemTable,
  ImportProblemTableFallback
} from '../assignment/_components/ImportProblemTable'

interface ImportProblemDialogProps {
  problems: AssignmentProblem[]
  setProblems: (problems: AssignmentProblem[]) => void
}

export function ImportProblemDialog({
  problems,
  setProblems
}: ImportProblemDialogProps) {
  const [showImportDialog, setShowImportDialog] = useState(false)
  return (
    <>
      <AlertModal
        trigger={
          <Button
            type="button"
            className="flex h-[36px] w-40 items-center gap-1 px-0"
          >
            <HiMiniPlusCircle className="h-5 w-5" />
            <div className="text-sm font-bold">Import problem</div>
          </Button>
        }
        type="confirm"
        title="Importing from Problem List"
        description="If assignment problems are imported from the ‘All Problem List’, the problems will automatically become invisible state.
These problems will be shared with your course’s instructors."
        primaryButton={{ text: 'OK', onClick: () => setShowImportDialog(true) }}
      />
      <Modal
        size="lg"
        type="custom"
        title="Import / Edit Problem"
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        className="!gap-0"
      >
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
      </Modal>
    </>
  )
}
