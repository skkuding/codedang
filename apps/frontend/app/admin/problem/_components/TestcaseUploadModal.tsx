'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import JSZip from 'jszip'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

interface TestcaseUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (testcases: Array<{ input: string; output: string }>) => void
  isHidden: boolean
}

export function TestcaseUploadModal({
  isOpen,
  onClose,
  onUpload,
  isHidden
}: TestcaseUploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setUploadedFile(file)
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
        onUpload(testcases)
      } else {
        toast.error('No testcases found in the ZIP file')
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
    onClose()
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleClose}
      size="md"
      type="custom"
      title={`Upload Testcases via ZIP`}
      headerDescription={`Upload ${isHidden ? 'Hidden' : 'Sample'} testcases from a single ZIP file.`}
      onClose={handleClose}
      primaryButton={{
        text: isProcessing ? 'Processing...' : 'Upload',
        onClick: processZipFile,
        variant: 'default'
      }}
      secondaryButton={{
        text: 'Cancel',
        onClick: handleClose,
        variant: 'outline'
      }}
    >
      <div className="flex flex-col gap-4 py-4">
        <strong>File Format:</strong>
        • Name your files like 1.in, 1.out, 2.in, 2.out, etc.
        <br />
        • Use .in for input files and .out for output files.
        <br />• The testcases will be sorted and uploaded by number.
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            Select ZIP File
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
