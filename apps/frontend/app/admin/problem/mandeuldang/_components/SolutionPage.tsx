'use client'

import { Button } from '@/components/shadcn/button'
import InfoIcon from '@/public/icons/info.svg'
import TrashcanIcon from '@/public/icons/trashcan.svg'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import {
  mockRunSolutionVerification,
  mockUploadSolution
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

export function SolutionPage() {
  // TODO: 백엔드에서 role을 받아오면 임시 role state와 전환 버튼 제거
  const [role, setRole] = useState<MandeuldangRole | null>('Owner')
  const { canUploadSolution } = useMandeuldangPermission(role)

  const [solutionFile, setSolutionFile] = useState<UploadedFile | null>(null)
  const verification = useVerification(mockRunSolutionVerification)
  const upload = useMutation({
    mutationFn: mockUploadSolution,
    onSuccess: (file) => {
      setSolutionFile(file)
      verification.reset()
    }
  })

  const canModify =
    canUploadSolution && !verification.isVerifying && !upload.isPending

  // TODO: 솔루션 삭제 API 연동
  const handleSolutionDelete = () => {
    setSolutionFile(null)
    verification.reset()
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <MandeuldangRoleSwitchButton role={role} setRole={setRole} />
      </div>

      <SectionCard
        title="솔루션 업로드"
        description="참고 솔루션 (정답 코드)을 업로드하고, 테스트 케이스와 함께 검증하세요"
        headerClassName="gap-[6px]"
        actions={
          <FileUploadButton
            disabled={!canModify || solutionFile !== null}
            onSelect={upload.mutate}
          />
        }
      >
        {solutionFile ? (
          <FileInfoCard
            file={solutionFile}
            action={
              <Button
                type="button"
                variant="outline"
                className="border-color-cool-neutral-80 bg-color-cool-neutral-99 h-auto shrink-0 rounded-[8px] px-4 py-3"
                aria-label="솔루션 삭제"
                disabled={!canModify}
                onClick={handleSolutionDelete}
              >
                <TrashcanIcon className="text-color-cool-neutral-60 size-5" />
              </Button>
            }
          />
        ) : (
          <div className="bg-color-neutral-99 flex flex-col items-center gap-3 rounded-[12px] py-16">
            <InfoIcon className="text-color-cool-neutral-60 size-6" />
            <p className="text-body1_m_16 text-color-cool-neutral-40 text-center">
              아직 솔루션이 업로드 되지 않았습니다.
              <br />
              배포/Ready 상태 전환을 위해 솔루션 파일 업로드가 필수입니다.
            </p>
          </div>
        )}
        {upload.error && (
          <p role="alert" className="text-error text-body2_m_14">
            {upload.error.message}
          </p>
        )}
      </SectionCard>

      <VerificationRunCard
        title="솔루션 검증 실행"
        description="업로드 된 Validator 파일 토대로 Input 테스트케이스 검증을 실행합니다"
        disabled={!canModify || solutionFile === null}
        onVerify={verification.verify}
        status={verification.status}
        result={verification.result}
        errorMessage={verification.errorMessage}
      />
    </div>
  )
}
