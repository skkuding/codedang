import { Badge } from '@/components/shadcn/badge'
import { cn } from '@/libs/utils'
import fileIcon from '@/public/icons/file_gray.svg'
import InfoIcon from '@/public/icons/info-icon-gray.svg'
import trashcanIcon from '@/public/icons/trashcan2-gray.svg'
import uploadIcon from '@/public/icons/upload-blue.svg'
import Image from 'next/image'
import type { ChangeEvent, ReactNode } from 'react'
import { useState, useRef } from 'react'

interface UploadedFile {
  name: string
  size: string
}

interface FileUploadSectionProps {
  title: string
  description: string
  emptyMessages: string[]
  accept: string
  optional?: boolean
  children?: ReactNode
  className?: string
}

const FORMAT_EXAMPLES = [
  'Generator : generator.cpp / generator.py',
  'Validator : validator.cpp (testlib 등)',
  'Checker : checker.cpp (특수 채점)'
]

export function FileUploadSection({
  title,
  description,
  emptyMessages,
  accept,
  optional,
  children,
  className
}: FileUploadSectionProps) {
  const [file, setFile] = useState<UploadedFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) {
      return
    }

    const allowedExtensions = accept.split(',').map((ext) => ext.trim())
    const selected = selectedFiles[0]

    if (!allowedExtensions.some((ext) => selected.name.endsWith(ext))) {
      alert(`${accept} 파일만 업로드 가능합니다.`)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    setFile({
      name: selected.name,
      size: `${(selected.size / 1024).toFixed(1)}KB`
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = () => {
    setFile(null)
  }

  return (
    <div
      className={cn(
        'border-color-cool-neutral-90 rounded-[16px] border px-6 py-7',
        className
      )}
    >
      <div className="flex justify-between border-b pb-5">
        <div>
          <p className="text-head5_sb_24 mb-1 flex items-center gap-2">
            {title}
            {optional && (
              <Badge className="text-primary hover:bg-color-blue-95 bg-color-blue-95 text-caption1_m_13 rounded-[4px] px-[10px] py-1">
                선택
              </Badge>
            )}
          </p>
          <p className="text-body2_m_14 text-color-cool-neutral-40">
            {description}
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          multiple
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="border-primary-light text-primary text-sub4_sb_14 flex h-fit items-center gap-[6px] rounded-[8px] border-[1.4px] px-3 py-[10px] transition-colors hover:bg-blue-50"
        >
          <Image src={uploadIcon} alt="upload" width={20} height={20} />
          파일 업로드
        </button>
      </div>

      <div className="my-5 min-h-[160px]">
        {file === null ? (
          <div className="bg-color-neutral-99 flex flex-col items-center rounded-[12px] py-20 text-center">
            <Image
              src={InfoIcon}
              alt="info"
              width={24}
              height={24}
              className="mb-2"
            />
            {emptyMessages.map((msg, idx) => (
              <p
                key={idx}
                className="text-body1_m_16 text-color-cool-neutral-50"
              >
                {msg}
              </p>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-[12px] bg-white p-4 shadow-[0_4px_20px_0_rgba(53,78,116,0.10)]">
            <div className="flex gap-4">
              <span className="bg-color-neutral-99 flex h-12 w-12 items-center justify-center rounded-[6.4px] border">
                <Image src={fileIcon} alt="file" width={24} height={24} />
              </span>
              <div>
                <p className="text-sub1_sb_18">{file.name}</p>
                <p className="text-sub4_sb_14 text-color-cool-neutral-40">
                  {file.size}
                </p>
              </div>
            </div>
            <button
              onClick={handleDelete}
              className="border-color-neutral-90 bg-color-neutral-99 hover:bg-color-neutral-95/80 flex h-9 w-12 items-center justify-center rounded-full border transition-all"
            >
              <Image src={trashcanIcon} alt="trash" width={16} height={16} />
            </button>
          </div>
        )}
      </div>

      <p className="text-sub1_sb_18 text-color-cool-neutral-30 mb-2">
        포맷 예시
      </p>
      <div className="bg-color-neutral-99 border-color-cool-neutral-90 flex flex-col gap-2 rounded-[8px] border p-4">
        {FORMAT_EXAMPLES.map((example, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="bg-color-neutral-30 h-1 w-1 shrink-0 rounded-full" />
            <p className="text-body3_r_16 text-color-neutral-30">{example}</p>
          </div>
        ))}
      </div>

      {children}
    </div>
  )
}
