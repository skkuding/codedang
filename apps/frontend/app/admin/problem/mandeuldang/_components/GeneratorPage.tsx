'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import DownloadIcon from '@/public/icons/download.svg'
import TrashcanIcon from '@/public/icons/trashcan.svg'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { downloadBlob } from '../_libs/downloadBlob'
import {
  mockGenerateInput,
  mockUploadGenerator
} from '../_libs/mockGeneratorApi'
import type { MandeuldangRole } from '../_libs/permissions'
import type { UploadedFile } from '../_libs/types'
import { useMandeuldangPermission } from '../_libs/useMandeuldangPermission'
import { useTestcaseGeneration } from '../_libs/useTestcaseGeneration'
import { FileInfoCard } from './FileInfoCard'
import { FileUploadButton } from './FileUploadButton'
import { GenerationResultCard } from './GenerationResultCard'
import { GenerationRunCard } from './GenerationRunCard'
import { MandeuldangRoleSwitchButton } from './MandeuldangRoleSwitchButton'
import { SectionCard } from './SectionCard'

export function GeneratorPage() {
  // TODO: 백엔드에서 role을 받아오면 임시 role state와 전환 버튼 제거
  const [role, setRole] = useState<MandeuldangRole | null>('Owner')
  const { canManageGenerator } = useMandeuldangPermission(role)

  const [generatorFile, setGeneratorFile] = useState<UploadedFile | null>(null)
  const upload = useMutation({
    mutationFn: mockUploadGenerator,
    onSuccess: (file) => setGeneratorFile(file)
  })
  const generation = useTestcaseGeneration(mockGenerateInput)
  const { generatedTestcase: generatedInput } = generation

  const canModify =
    canManageGenerator && !generation.isGenerating && !upload.isPending

  // TODO: Generator 삭제 API 연동
  const handleGeneratorDelete = () => {
    setGeneratorFile(null)
    generation.reset()
  }

  // TODO: INPUT testcase download API 연동 후 교체
  const handleGeneratedInputDownload = () => {
    if (generatedInput) {
      downloadBlob(
        new Blob([generatedInput.preview], { type: 'text/plain' }),
        'input-testcases.txt'
      )
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <MandeuldangRoleSwitchButton role={role} setRole={setRole} />
      </div>

      <SectionCard
        title="Generator 업로드"
        description="Input 테스트케이스를 생성하는 파일 및 스크립트를 업로드하세요 (최대 한 개의 파일 업로드 가능)"
        headerClassName="gap-[6px]"
        actions={
          <FileUploadButton
            disabled={!canModify || generatorFile !== null}
            onSelect={upload.mutate}
          />
        }
      >
        {generatorFile && (
          <FileInfoCard
            file={generatorFile}
            action={
              <Button
                type="button"
                variant="outline"
                className="border-color-cool-neutral-80 bg-color-cool-neutral-99 h-auto shrink-0 rounded-[8px] px-4 py-3"
                aria-label="Generator 삭제"
                disabled={!canModify}
                onClick={handleGeneratorDelete}
              >
                <TrashcanIcon className="text-color-cool-neutral-60 size-5" />
              </Button>
            }
          />
        )}
        {upload.error && (
          <p role="alert" className="text-error text-body2_m_14">
            {upload.error.message}
          </p>
        )}
      </SectionCard>

      <GenerationRunCard
        target="Input"
        sourceName="Generator"
        buttonText="TC 생성"
        disabled={!canModify || generatorFile === null}
        onGenerate={generation.generate}
        status={generation.status}
        generatedTestcase={generatedInput}
        errorMessage={generation.errorMessage}
      />

      {generatedInput && (
        <GenerationResultCard
          target="Input"
          preview={generatedInput.preview}
          actions={
            <>
              <Button
                type="button"
                variant="lined"
                size="middle"
                className="rounded-[10px]"
                disabled={!canModify}
                onClick={generation.reset}
              >
                <TrashcanIcon
                  className={cn(
                    'size-5',
                    canModify ? 'text-primary-strong' : 'text-primary-light'
                  )}
                />
                <span className="translate-y-px">TC 삭제</span>
              </Button>
              <Button
                type="button"
                size="middle"
                className="bg-primary-strong hover:bg-primary-heavy rounded-[10px]"
                onClick={handleGeneratedInputDownload}
              >
                <DownloadIcon className="size-4 text-white" />
                <span className="translate-y-px">파일 다운로드</span>
              </Button>
            </>
          }
        />
      )}
    </div>
  )
}
