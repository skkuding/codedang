'use client'

import { cn } from '@/libs/utils'
import InfoIconGray from '@/public/icons/info-icon-gray.svg'
import TrashIcon from '@/public/icons/trashcan2-gray.svg'
import { useRef, useState } from 'react'
import { AiFillFile } from 'react-icons/ai'
import { TbCode } from 'react-icons/tb'

interface FileUploadProps {
  primaryText: string
  secondaryText: string
  onFilesChange: (files: File[]) => void
  multiple?: boolean
  className?: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function FileUpload({
  primaryText,
  secondaryText,
  onFilesChange,
  multiple,
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

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    onFilesChange(next)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {files.length > 0 && (
        <ul className="flex flex-col gap-2">
          {files.map((f, i) => {
            const isZip = f.name.endsWith('.zip')
            return (
              <li
                key={`${f.name}-${i}`}
                className="flex items-center justify-between rounded-[12px] px-4 py-3 shadow-[0_4px_20px_0_rgba(53,78,116,0.10)]"
              >
                <div className="flex items-center gap-3">
                  <div className="border-line bg-color-neutral-99 grid size-12 place-items-center rounded-[6.4px] border-[0.8px]">
                    {isZip ? (
                      <TbCode
                        size={24}
                        className="text-color-cool-neutral-50"
                      />
                    ) : (
                      <AiFillFile
                        size={24}
                        className="text-color-cool-neutral-50"
                      />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sub1_sb_18 mb-[2px]">{f.name}</span>
                    <span className="text-sub4_sb_14 text-color-cool-neutral-50">
                      {formatFileSize(f.size)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="border-color-neutral-90 bg-color-neutral-99 flex items-center justify-center rounded-full border px-4 py-[10px]"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {files.length === 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            handleFiles(e.dataTransfer.files)
          }}
          className="bg-color-neutral-99 flex cursor-pointer flex-col items-center justify-center rounded-[12px] py-20"
        >
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-col items-center gap-[10px]">
            <InfoIconGray className="mb-2" height={24} width={24} />
            <div className="text-body1_m_16 text-color-cool-neutral-50 whitespace-pre-wrap text-center">
              <p>{primaryText}</p>
              <p>{secondaryText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
