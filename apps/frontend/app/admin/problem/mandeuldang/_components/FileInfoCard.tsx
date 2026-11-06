import { dateFormatter } from '@/libs/utils'
import FileGrayIcon from '@/public/icons/file_gray.svg'
import type { ReactNode } from 'react'
import type { UploadedFile } from '../_libs/types'

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface FileInfoCardProps {
  file: UploadedFile
  action: ReactNode
}

export function FileInfoCard({ file, action }: FileInfoCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-[12px] p-4 shadow-[0_4px_20px_0_rgba(53,78,116,0.10)]">
      <div className="bg-color-neutral-99 border-line shrink-0 items-center rounded-[6.4px] border p-4">
        <FileGrayIcon className="size-6" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[2px]">
        <p className="text-sub1_sb_18 truncate">
          {dateFormatter(file.createdAt, 'YYMMDD')}. {file.name}
        </p>
        <p className="text-sub4_sb_14 text-color-cool-neutral-40">
          {formatFileSize(file.size)}
        </p>
      </div>
      {action}
    </div>
  )
}
