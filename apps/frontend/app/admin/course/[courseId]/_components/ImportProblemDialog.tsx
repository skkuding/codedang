'use client'

import { AlertModal } from '@/components/AlertModal'
import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ErrorBoundary } from '@suspensive/react'
import { useTranslate } from '@tolgee/react'
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
            <div className="text-sm font-bold">{t('import_problem')}</div>
          </Button>
        }
        type="confirm"
        title={t('importing_from_problem_list_title')}
        description={t('importing_from_problem_list_description')}
        primaryButton={{
          text: t('ok_button'),
          onClick: () => setShowImportDialog(true)
        }}
      />
      <Modal
        size="lg"
        type="custom"
        title={t('import_edit_problem_title')}
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
