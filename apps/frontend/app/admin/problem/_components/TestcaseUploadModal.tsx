'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { useTranslate } from '@tolgee/react'
import JSZip from 'jszip'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

interface TestcaseUploadModalProps {
  onUpload: (
    testcases: Array<{ input: string; output: string }>,
    zipFile: File
  ) => void
  isHidden: boolean
  disabled?: boolean
}

export function TestcaseUploadModal({
  onUpload,
  isHidden,
  disabled = false
}: TestcaseUploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslate()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      console.log('Original file:', {
        name: file.name,
        type: file.type,
        size: file.size
      })

      // MIME 타입을 application/zip으로 강제 변경
      const modifiedFile = new File([file], file.name, {
        type: 'application/zip',
        lastModified: file.lastModified
      })

      console.log('Modified file:', {
        name: modifiedFile.name,
        type: modifiedFile.type,
        size: modifiedFile.size
      })

      setUploadedFile(modifiedFile)
    } else {
      setUploadedFile(null)
    }
  }

  const processZipFile = async () => {
    if (!uploadedFile) {
      return
    }

    setIsProcessing(true)
    try {
      const zip = await JSZip.loadAsync(uploadedFile)
      const filePairs = new Map<number, { input?: string; output?: string }>()
      const contentPromises: Promise<void>[] = []

      zip.forEach((_, zipEntry) => {
        const match = zipEntry.name.match(/(\d+)\.(in|out)$/)
        if (!zipEntry.dir && match) {
          const testcaseNum = parseInt(match[1])
          const fileType = match[2] as 'in' | 'out'

          if (!filePairs.has(testcaseNum)) {
            filePairs.set(testcaseNum, {})
          }
          const pair = filePairs.get(testcaseNum)

          const promise = (async () => {
            const content = await zipEntry.async('string')
            if (pair) {
              if (fileType === 'in') {
                pair.input = content
              } else {
                pair.output = content
              }
            }
          })()

          contentPromises.push(promise)
        }
      })

      await Promise.all(contentPromises)

      const testcases: Array<{ input: string; output: string }> = Array.from(
        filePairs.keys()
      )
        .sort((a, b) => a - b)
        .reduce(
          (acc, key) => {
            const pair = filePairs.get(key)
            if (pair && pair.input !== undefined && pair.output !== undefined) {
              acc.push({ input: pair.input, output: pair.output })
            }
            return acc
          },
          [] as Array<{ input: string; output: string }>
        )

      if (testcases.length > 0) {
        onUpload(testcases, uploadedFile)
      } else {
        toast.error(t('no_testcases_error'))
      }

      handleClose()
    } catch (error) {
      console.error('Error processing ZIP file:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setUploadedFile(null)
    setIsOpen(false)
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={setIsOpen}
      size="md"
      type="custom"
      title={t('upload_testcases_title')}
      headerDescription={t('upload_testcases_description', {
        isHidden: isHidden ? 'hidden' : 'sample'
      })}
      onClose={handleClose}
      primaryButton={{
        text: isProcessing
          ? t('processing_button_text')
          : t('upload_button_text'),
        onClick: processZipFile,
        variant: 'default'
      }}
      secondaryButton={{
        text: t('cancel_button_text'),
        onClick: handleClose,
        variant: 'outline'
      }}
      trigger={
        <button
          className={`flex items-center justify-center rounded-[1000px] border px-[24px] py-[10px] ${
            disabled
              ? 'cursor-not-allowed border-[#D8D8D8] bg-[#F5F5F5] opacity-50'
              : 'cursor-pointer border-[#C4C4C4] bg-[#F5F5F5] hover:bg-[#E5E5E5]'
          }`}
          type="button"
          disabled={disabled}
        >
          <Image
            src="/icons/upload.svg"
            alt={t('upload_icon_alt')}
            width={20}
            height={20}
          />
        </button>
      }
    >
      <div className="flex flex-col gap-4 py-4">
        <strong>{t('file_format_title')}</strong>•{' '}
        {t('file_format_instruction_1')}
        <br />• {t('file_format_instruction_2')}
        <br />• {t('file_format_instruction_3')}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            {t('select_zip_button')}
          </Button>
          {uploadedFile && (
            <span className="text-sm text-gray-600">{uploadedFile.name}</span>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,application/zip,application/x-zip-compressed"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </Modal>
  )
}
