'use client'

import { cn } from '@/libs/utils'
import InfoIconGray from '@/public/icons/info-icon-gray.svg'
import { useRef, useState } from 'react'

interface FileUploadProps {
  primaryText: string
  secondaryText: string
  multiple?: boolean
  onFilesChange: (files: File[]) => void
  className?: string
}

export function FileUpload({
  primaryText,
  secondaryText,
  multiple = false,
  onFilesChange,
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) {
      return
    }
    const next = Array.from(incoming)
    setFiles(next)
    onFilesChange(next)
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        handleFiles(e.dataTransfer.files)
      }}
      className={cn(
        'border-color-cool-neutral-80 bg-color-neutral-99 flex cursor-pointer flex-col items-center justify-center rounded-[12px] py-20',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-[10px]">
          <InfoIconGray className="mb-2" height={24} width={24} />
          <div className="text-body1_m_16 text-color-cool-neutral-50 whitespace-pre-wrap text-center">
            <p>{primaryText}</p>
            <p>{secondaryText}</p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col items-center gap-1">
          {files.map((f) => (
            <li
              key={f.name}
              className="text-sub4_sb_14 text-color-cool-neutral-30"
            >
              {f.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
