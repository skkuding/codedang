'use client'

import { Button } from '@/components/shadcn/button'
import { Progress } from '@/components/shadcn/progress'
import { cn } from '@/libs/utils'
import FileGrayIcon from '@/public/icons/file_gray.svg'
import TrashcanIcon from '@/public/icons/trashcan2-gray.svg'
import UploadIcon from '@/public/icons/upload.svg'
import { useRef, useState } from 'react'
import type { MandeuldangRole } from '../_libs/permissions'
import { useMandeuldangPermission } from '../_libs/useMandeuldangPermission'
import { MandeuldangRoleSwitchButton } from './MandeuldangRoleSwitchButton'

type SolutionStatus = 'Pending' | 'Running' | 'Success' | 'Failed'

interface SolutionFile {
  id: string
  name: string
  size: number
  status: SolutionStatus
}

// TODO: presigned URL 발급 API 나오면 실제 업로드 로직으로 교체
function mockUploadSolution(
  file: File,
  onStatusChange: (status: SolutionStatus) => void
) {
  onStatusChange('Pending')

  setTimeout(() => {
    onStatusChange('Running')

    setTimeout(() => {
      // 90% 확률로 성공하는 더미 로직 (실패 케이스 UI도 확인하기 위함)
      const isSuccess = Math.random() > 0.1
      onStatusChange(isSuccess ? 'Success' : 'Failed')
    }, 1200)
  }, 300)
}

export function SolutionPage() {
  // TODO: 컨테이너에서 role을 내려받는 구조로 교체 (현재는 StatementPage와 동일하게 임시 처리)
  const [role, setRole] = useState<MandeuldangRole | null>('Owner')
  const permissions = useMandeuldangPermission(role)

  const [solutions, setSolutions] = useState<SolutionFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const id = crypto.randomUUID()
    const newSolution: SolutionFile = {
      id,
      name: file.name,
      size: file.size,
      status: 'Pending'
    }

    setSolutions((prev) => [...prev, newSolution])

    mockUploadSolution(file, (status) => {
      setSolutions((prev) =>
        prev.map((sol) => (sol.id === id ? { ...sol, status } : sol))
      )
    })

    // 같은 파일 다시 선택 가능하도록 input 초기화
    e.target.value = ''
  }

  const handleDelete = (id: string) => {
    setSolutions((prev) => prev.filter((sol) => sol.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const statusText: Record<SolutionStatus, string> = {
    Pending: '대기 중',
    Running: '실행 중',
    Success: '기준 솔루션 실행 완료',
    Failed: '실행 실패'
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 개발 확인용 - 실제 role 연동 전까지만 사용 */}
      <MandeuldangRoleSwitchButton role={role} setRole={setRole} />

      <section className="flex flex-col gap-5 rounded-2xl bg-white px-6 py-7">
        <div className="flex flex-col gap-2">
          <p className="text-head5_sb_24">솔루션 업로드</p>
          <p className="text-color-cool-neutral-40 text-body2_m_14">
            테스트케이스 OUTPUT 생성에 사용할 기준 솔루션을 업로드하세요. 최소
            1개 이상의 솔루션이 필요합니다.
          </p>
        </div>

        <label
          className={cn(
            'flex h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200',
            permissions.isReadOnly
              ? 'cursor-not-allowed bg-gray-50 opacity-50'
              : 'hover:border-primary cursor-pointer'
          )}
        >
          <UploadIcon width={24} height={24} className="text-gray-400" />
          <p className="text-body2_m_14 text-color-cool-neutral-40">
            클릭하여 솔루션 파일 업로드
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            disabled={permissions.isReadOnly}
            onChange={handleFileSelect}
          />
        </label>

        {solutions.length === 0 ? (
          <p className="text-body3_r_16 text-color-cool-neutral-60">
            아직 업로드된 솔루션이 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {solutions.map((solution) => (
              <div
                key={solution.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <FileGrayIcon width={20} height={20} />
                  <div className="flex flex-col">
                    <p className="text-sub3_sb_16">{solution.name}</p>
                    <p className="text-caption3_r_13 text-color-cool-neutral-60">
                      {formatFileSize(solution.size)} ·{' '}
                      {statusText[solution.status]}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {solution.status === 'Running' && (
                    <Progress value={60} className="w-24" />
                  )}
                  {solution.status === 'Failed' && (
                    <span className="text-caption3_r_13 text-red-500">
                      실행 로그 확인 필요
                    </span>
                  )}
                  {!permissions.isReadOnly && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-fit p-1"
                      onClick={() => handleDelete(solution.id)}
                    >
                      <TrashcanIcon width={18} height={18} />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
