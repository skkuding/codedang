'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import DownloadIcon from '@/public/icons/download.svg'
import TrashcanIcon from '@/public/icons/trashcan.svg'
import { useMemo, useState } from 'react'
import { downloadBlob } from '../_libs/downloadBlob'
import { mockGenerateOutput } from '../_libs/mockOutputApi'
import type { MandeuldangRole } from '../_libs/permissions'
import type { UploadedFile } from '../_libs/types'
import { useMandeuldangPermission } from '../_libs/useMandeuldangPermission'
import { useTestcaseGeneration } from '../_libs/useTestcaseGeneration'
import { FileInfoCard } from './FileInfoCard'
import { GenerationResultCard } from './GenerationResultCard'
import { GenerationRunCard } from './GenerationRunCard'
import { MandeuldangRoleSwitchButton } from './MandeuldangRoleSwitchButton'

// TODO: Solution / Validator workflow 연동 후 실제 상태로 교체
const TEMP_PREREQUISITES = {
  hasSolution: true,
  hasGeneratedInput: true,
  isInputValidated: true
} as const

export function OutputCasePage() {
  const [role, setRole] = useState<MandeuldangRole | null>('Owner')
  const { canCreateOutput } = useMandeuldangPermission(role)

  const generation = useTestcaseGeneration(mockGenerateOutput)
  const { generatedTestcase: generatedOutput } = generation
  // TODO: workflow 연동 후 INPUT / OUTPUT testcase count 일치 여부 검증

  const { hasSolution, hasGeneratedInput, isInputValidated } =
    TEMP_PREREQUISITES
  const canModify = canCreateOutput && !generation.isGenerating
  const canGenerateOutput =
    canModify && hasSolution && hasGeneratedInput && isInputValidated

  // TODO: OUTPUT 생성 API 연동 후 응답의 파일 메타데이터로 교체
  const outputFile = useMemo<UploadedFile | null>(
    () =>
      generatedOutput && {
        name: 'Output Testcases',
        size: new Blob([generatedOutput.preview]).size,
        createdAt: generatedOutput.generatedAt
      },
    [generatedOutput]
  )

  // TODO: OUTPUT testcase 삭제 API 연동
  const handleGeneratedOutputDelete = () => {
    generation.reset()
  }

  // TODO: OUTPUT testcase download API 연동 후 교체
  const handleGeneratedOutputDownload = () => {
    if (generatedOutput) {
      downloadBlob(
        new Blob([generatedOutput.preview], { type: 'text/plain' }),
        'output-testcases.txt'
      )
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <MandeuldangRoleSwitchButton role={role} setRole={setRole} />
      </div>

      <GenerationRunCard
        target="Output"
        sourceName="Solution"
        buttonText="Output 생성"
        disabled={!canGenerateOutput}
        onGenerate={generation.generate}
        status={generation.status}
        generatedTestcase={generatedOutput}
        errorMessage={generation.errorMessage}
      />

      {generatedOutput && (
        <GenerationResultCard
          target="Output"
          preview={generatedOutput.preview}
          actions={
            <Button
              type="button"
              variant="lined"
              size="middle"
              className="rounded-[10px]"
              disabled={!canModify}
              onClick={handleGeneratedOutputDelete}
            >
              <TrashcanIcon
                className={cn(
                  'size-5',
                  canModify ? 'text-primary-strong' : 'text-primary-light'
                )}
              />
              <span className="translate-y-px">Output 삭제</span>
            </Button>
          }
        >
          {outputFile && (
            <FileInfoCard
              file={outputFile}
              action={
                <Button
                  type="button"
                  variant="lined"
                  size="middle"
                  className="shrink-0 rounded-[10px]"
                  onClick={handleGeneratedOutputDownload}
                >
                  <DownloadIcon className="text-primary-strong size-4" />
                  <span className="translate-y-px">파일 다운받기</span>
                </Button>
              }
            />
          )}
        </GenerationResultCard>
      )}
    </div>
  )
}
