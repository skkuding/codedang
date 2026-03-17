import infoIcon from '@/public/icons/file-info-gray.svg'
import fileIcon from '@/public/icons/file_gray.svg'
import trashcanIcon from '@/public/icons/trashcan2-gray.svg'
import uploadIcon from '@/public/icons/upload-blue.svg'
import Image from 'next/image'
import type { ChangeEvent } from 'react'
import { useState, useRef } from 'react'

interface UploadedFile {
  id: string
  name: string
  size: string
}

interface FileUploadSectionProps {
  title: string
  description: string
  emptyMessages: string[]
  accept: string
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
  accept
}: FileUploadSectionProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles) {
      return
    }

    const allowedExtensions = accept.split(',').map((ext) => ext.trim())

    const newFiles: UploadedFile[] = Array.from(selectedFiles)
      .filter((file) =>
        allowedExtensions.some((ext) => file.name.endsWith(ext))
      )
      .map((file) => {
        const uniqueId = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

        return {
          id: uniqueId,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)}KB`
        }
      })

    if (newFiles.length === 0 && selectedFiles.length > 0) {
      alert(`${accept} 파일만 업로드 가능합니다.`)
      return
    }

    setFiles((prev) => [...prev, ...newFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  return (
    <div className="border-1 px-6 py-7">
      <div className="border-b-1 flex justify-between pb-5">
        <div>
          <p className="text-head5_sb_24 mb-1">{title}</p>
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
        {files.length === 0 ? (
          <div className="bg-color-neutral-99 flex flex-col items-center rounded-[12px] py-20 text-center">
            <Image
              src={infoIcon}
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
          <div className="flex flex-col gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-[12px] bg-white p-4 shadow-[0_4px_20px_0_rgba(53,78,116,0.10)]"
              >
                <div className="flex gap-4">
                  <span className="bg-color-neutral-99 flex h-12 w-12 items-center justify-center rounded-[6.4px] border">
                    <Image src={fileIcon} alt="file" width={20} height={20} />
                  </span>
                  <div>
                    <p className="text-sub1_sb_18">{file.name}</p>
                    <p className="text-sub4_sb_14 text-color-cool-neutral-40">
                      {file.size}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="border-1 border-color-neutral-90 bg-color-neutral-99 hover:bg-color-neutral-95/80 flex h-9 w-12 items-center justify-center rounded-full transition-all"
                >
                  <Image
                    src={trashcanIcon}
                    alt="trash"
                    width={16}
                    height={16}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-sub1_sb_18 mb-2">포맷 예시</p>
      <div className="bg-color-neutral-99 border-1 border-color-cool-neutral-90 flex flex-col gap-2 rounded-[8px] p-4">
        {FORMAT_EXAMPLES.map((example, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="h-1 w-1 shrink-0 rounded-full bg-black" />
            <p className="text-body3_r_16">{example}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
