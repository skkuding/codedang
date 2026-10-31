'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import FileGrayIcon from '@/public/icons/file_gray.svg'
import TrashcanIcon from '@/public/icons/trashcan2-gray.svg'
import UploadIcon from '@/public/icons/upload.svg'
import { useState } from 'react'
import type { MandeuldangRole } from '../_libs/permissions'
import { useMandeuldangPermission } from '../_libs/useMandeuldangPermission'

type ValidationStatus = 'Idle' | 'Pending' | 'Running' | 'Success' | 'Failed'

interface ValidatorFile {
  name: string
  size: number
}

interface FailedCase {
  testcaseIndex: number
  reason: string
}

// TODO: 실제 Validator 업로드 API 나오면 교체
function mockUploadValidator(
  file: File,
  onDone: (uploaded: ValidatorFile) => void
) {
  setTimeout(() => {
    onDone({ name: file.name, size: file.size })
  }, 500)
}

// TODO: 실제 검증 실행 API 나오면 교체
// D님의 INPUT 생성 결과(테스트케이스 개수)를 받아서 검증하는 형태가 될 예정
function mockRunValidation(
  onStatusChange: (status: ValidationStatus) => void,
  onResult: (failedCases: FailedCase[]) => void
) {
  onStatusChange('Pending')

  setTimeout(() => {
    onStatusChange('Running')

    setTimeout(() => {
      // 더미: 10개 중 2개 실패했다고 가정
      const dummyFailedCases: FailedCase[] = [
        {
          testcaseIndex: 3,
          reason: '값 범위 초과 (제한: 1 ≤ N ≤ 100000, 실제: 150000)'
        },
        {
          testcaseIndex: 7,
          reason: '입력 형식 오류 (숫자가 와야 할 자리에 문자열 존재)'
        }
      ]

      if (dummyFailedCases.length > 0) {
        onStatusChange('Failed')
        onResult(dummyFailedCases)
      } else {
        onStatusChange('Success')
        onResult([])
      }
    }, 1500)
  }, 300)
}

export function ValidatorPage() {
  // TODO: 컨테이너에서 role을 내려받는 구조로 교체
  const [role] = useState<MandeuldangRole | null>('Owner')
  const permissions = useMandeuldangPermission(role)

  const [validatorFile, setValidatorFile] = useState<ValidatorFile | null>(null)
  const [status, setStatus] = useState<ValidationStatus>('Idle')
  const [failedCases, setFailedCases] = useState<FailedCase[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    mockUploadValidator(file, (uploaded) => {
      setValidatorFile(uploaded)
      setStatus('Idle')
      setFailedCases([])
    })

    e.target.value = ''
  }

  const handleDeleteValidator = () => {
    setValidatorFile(null)
    setStatus('Idle')
    setFailedCases([])
  }

  const handleRunValidation = () => {
    mockRunValidation(setStatus, setFailedCases)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`
    }
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  const statusBadge: Record<ValidationStatus, string> = {
    Idle: '검증 대기',
    Pending: '대기 중',
    Running: '검증 실행 중',
    Success: '검증 통과',
    Failed: '검증 실패'
  }

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-white px-6 py-7">
      <div className="flex flex-col gap-2">
        <p className="text-head5_sb_24">입력 검증</p>
        <p className="text-color-cool-neutral-40 text-body2_m_14">
          Validator를 업로드하여 생성된 INPUT이 문제의 제약 조건을 만족하는지
          검증하세요.
        </p>
      </div>

      {!validatorFile ? (
        <label
          className={cn(
            'flex h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200',
            permissions.isReadOnly
              ? 'cursor-not-allowed bg-gray-50 opacity-50'
              : 'hover:border-primary cursor-pointer'
          )}
        >
          <UploadIcon width={22} height={22} className="text-gray-400" />
          <p className="text-body2_m_14 text-color-cool-neutral-40">
            클릭하여 Validator 파일 업로드
          </p>
          <input
            type="file"
            className="hidden"
            disabled={permissions.isReadOnly}
            onChange={handleFileSelect}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileGrayIcon width={20} height={20} />
            <div className="flex flex-col">
              <p className="text-sub3_sb_16">{validatorFile.name}</p>
              <p className="text-caption3_r_13 text-color-cool-neutral-60">
                {formatFileSize(validatorFile.size)}
              </p>
            </div>
          </div>
          {!permissions.isReadOnly && (
            <Button
              type="button"
              variant="ghost"
              className="h-fit p-1"
              onClick={handleDeleteValidator}
            >
              <TrashcanIcon width={18} height={18} />
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn('text-caption3_r_13 rounded-full px-3 py-1', {
              'bg-gray-100 text-gray-500': status === 'Idle',
              'bg-yellow-50 text-yellow-600':
                status === 'Pending' || status === 'Running',
              'bg-green-50 text-green-600': status === 'Success',
              'bg-red-50 text-red-600': status === 'Failed'
            })}
          >
            {statusBadge[status]}
          </span>
        </div>

        {!permissions.isReadOnly && (
          <Button
            type="button"
            disabled={!validatorFile || status === 'Running'}
            onClick={handleRunValidation}
          >
            입력 검증 실행
          </Button>
        )}
      </div>

      {status === 'Failed' && failedCases.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl bg-red-50 px-4 py-3">
          <p className="text-sub3_sb_16 text-red-600">
            실패한 테스트케이스 {failedCases.length}건
          </p>
          {failedCases.map((failedCase) => (
            <p
              key={failedCase.testcaseIndex}
              className="text-caption3_r_13 text-color-cool-neutral-40"
            >
              TC {failedCase.testcaseIndex}: {failedCase.reason}
            </p>
          ))}
        </div>
      )}
    </section>
  )
}
