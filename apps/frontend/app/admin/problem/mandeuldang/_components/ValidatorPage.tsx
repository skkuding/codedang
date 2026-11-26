'use client'

import { Button } from '@/components/shadcn/button'
import TrashcanIcon from '@/public/icons/trashcan.svg'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import {
  mockRunValidation,
  mockUploadValidator
} from '../_libs/mockVerificationApi'
import type { MandeuldangRole } from '../_libs/permissions'
import type { UploadedFile } from '../_libs/types'
import { useMandeuldangPermission } from '../_libs/useMandeuldangPermission'
import { useVerification } from '../_libs/useVerification'
import { FileInfoCard } from './FileInfoCard'
import { FileUploadButton } from './FileUploadButton'
import { MandeuldangRoleSwitchButton } from './MandeuldangRoleSwitchButton'
import { SectionCard } from './SectionCard'
import { VerificationRunCard } from './VerificationRunCard'

export function ValidatorPage() {
  // TODO: 백엔드에서 role을 받아오면 임시 role state와 전환 버튼 제거
  const [role, setRole] = useState<MandeuldangRole | null>('Owner')
  const { canManageValidator } = useMandeuldangPermission(role)

  const [validatorFile, setValidatorFile] = useState<UploadedFile | null>(null)
  const validation = useVerification(mockRunValidation)
  const upload = useMutation({
    mutationFn: mockUploadValidator,
    onSuccess: (file) => {
      setValidatorFile(file)
      validation.reset()
    }
  })

  const canModify =
    canManageValidator && !validation.isVerifying && !upload.isPending

  // TODO: Validator 삭제 API 연동
  const handleValidatorDelete = () => {
    setValidatorFile(null)
    validation.reset()
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <MandeuldangRoleSwitchButton role={role} setRole={setRole} />
      </div>

      <SectionCard
        title="Validator 업로드"
        description="Input 테스트케이스를 검증하는 파일 및 스크립트를 업로드하세요 (최대 한 개의 파일 업로드 가능)"
        headerClassName="gap-[6px]"
        actions={
          <FileUploadButton
            disabled={!canModify || validatorFile !== null}
            onSelect={upload.mutate}
          />
        }
      >
        {validatorFile && (
          <FileInfoCard
            file={validatorFile}
            action={
              <Button
                type="button"
                variant="outline"
                className="border-color-cool-neutral-80 bg-color-cool-neutral-99 h-auto shrink-0 rounded-[8px] px-4 py-3"
                aria-label="Validator 삭제"
                disabled={!canModify}
                onClick={handleValidatorDelete}
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

      <VerificationRunCard
        title="Input 검증 실행"
        description="업로드 된 Validator 파일 토대로 Input 테스트케이스 검증을 실행합니다"
        disabled={!canModify || validatorFile === null}
        onVerify={validation.verify}
        status={validation.status}
        result={validation.result}
        errorMessage={validation.errorMessage}
      />
    </div>
  )
}
