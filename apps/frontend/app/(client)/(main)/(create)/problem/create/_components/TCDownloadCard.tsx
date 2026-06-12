'use client'

import { Button } from '@/components/shadcn/button'

interface TCDownloadCardProps {
  onDelete: () => void
  onDownload: () => void
  disabled?: boolean
}

export function TCDownloadCard({
  onDelete,
  onDownload,
  disabled = false
}: TCDownloadCardProps) {
  return (
    <div className="border-color-cool-neutral-90 bg-color-common-100 rounded-2xl border px-6 py-7">
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-head5_sb_24 text-color-common-0">
            TC 삭제 및 다운로드
          </h3>
          <p className="text-color-cool-neutral-40 text-body2_m_14">
            생성한 TC 파일을 삭제 및 다운로드 할 수 있어요
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onDelete}
            disabled={disabled}
            type="button"
            className="ring-primary-light text-sub4_sb_14 text-primary hover:bg-color-blue-95 rounded-lg bg-white px-3 py-[10px] ring-[1.4px] disabled:ring-0"
          >
            TC 삭제하기
          </Button>
          <Button
            onClick={onDownload}
            disabled={disabled}
            type="button"
            className="bg-primary text-color-common-100 text-sub4_sb_14 hover:bg-primary-strong h-11 rounded-lg px-3 py-[10px]"
          >
            TC 다운로드
          </Button>
        </div>
      </div>
    </div>
  )
}
