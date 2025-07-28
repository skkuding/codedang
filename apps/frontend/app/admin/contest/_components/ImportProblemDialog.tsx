'use client'

import { AlertModal } from '@/components/AlertModal'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense, useState } from 'react'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import {
  ImportProblemTable,
  ImportProblemTableFallback
} from '../_components/ImportProblemTable'
import type { ContestProblem } from '../_libs/schemas'

interface ImportProblemDialogProps {
  problems: ContestProblem[]
  setProblems: (problems: ContestProblem[]) => void
  contestId?: string
}

export function ImportProblemDialog({
  problems,
  setProblems,
  contestId
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
        description="If contest problems are imported from the ‘All Problem List’, the problems will automatically become invisible state."
        primaryButton={{ text: 'OK', onClick: () => setShowImportDialog(true) }}
      />
      <Modal
        size="lg"
        type="custom"
        title="Import / Edit Problem"
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      >
        <ErrorBoundary fallback={FetchErrorFallback}>
          <Suspense fallback={<ImportProblemTableFallback />}>
            <ImportProblemTable
              contestId={contestId}
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
