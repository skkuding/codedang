'use client'

import { AlertModal } from '@/components/AlertModal'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { useTranslate } from '@tolgee/react'
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
  const { t } = useTranslate()

  return (
    <>
      <AlertModal
        trigger={
          <Button
            type="button"
            className="flex h-[36px] w-40 items-center gap-1 px-0"
          >
            <HiMiniPlusCircle className="h-5 w-5" />
            <div className="text-sm font-bold">
              {t('import_problem_button')}
            </div>
          </Button>
        }
        type="confirm"
        title={t('importing_from_problem_list_title')}
        description={t('importing_from_problem_list_description')}
        primaryButton={{ text: 'OK', onClick: () => setShowImportDialog(true) }}
      />
      <Modal
        size="lg"
        type="custom"
        title={t('import_edit_problem_title')}
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
