'use client'

import { InsertDialog } from '@/components/InsertDialog'
import { Input } from '@/components/shadcn/input'
import { UPLOAD_FILE } from '@/graphql/problem/mutations'
import Paperclip from '@/public/icons/texteditor-file.svg'
import { useMutation } from '@apollo/client'
import type { Editor } from '@tiptap/react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { forwardRef, useImperativeHandle } from 'react'
import { toast } from 'sonner'

export interface InsertNodeBarHandles {
  openFileDialog: () => void
}

interface InsertNodeBarProps {
  editor: Editor
}

export const InsertNodeBar = forwardRef<
  InsertNodeBarHandles,
  InsertNodeBarProps
>(function InsertNodeBar({ editor }, ref) {
  const [uploadFileMutation] = useMutation(UPLOAD_FILE)

  const [fileUrl, setFileUrl] = useState<string | undefined>('')
  const [fileName, setFileName] = useState<string | undefined>('')
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)

  const addFile = useCallback(
    (url?: string, name?: string) => {
      if (!url) {
        return
      }
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'fileDownload',
          attrs: { href: url, fileName: name ?? 'File' }
        })
        .run()
    },
    [editor]
  )

  const handleUploadFile = async (files: FileList | null) => {
    if (files === null) {
      return
    }
    const file = files[0]
    try {
      const { data } = await uploadFileMutation({
        variables: { input: { file } }
      })
      setFileUrl(data?.uploadFile.src ?? '')
      setFileName(file.name)
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message
        if (errorMessage === 'File size exceeds maximum limit') {
          toast.error('Files larger than 30MB cannot be uploaded.')
        }
      }
    }
  }

  useImperativeHandle(ref, () => ({
    openFileDialog: () => setIsFileDialogOpen(true)
  }))

  return (
    <InsertDialog
      open={isFileDialogOpen}
      editor={editor}
      activeType="file"
      title="Upload File"
      description={
        <>
          <Input
            type="file"
            accept="application/pdf"
            onChange={(e) => handleUploadFile(e.target.files)}
          />
          <span className="text-sm"> * File must be under 30MB</span>
        </>
      }
      triggerIcon={
        <Image src={Paperclip} alt="File" className="h-[18px] w-[18px]" />
      }
      onOpenChange={(open) => {
        setIsFileDialogOpen(open)
        if (!open) {
          setTimeout(() => editor.commands.focus(), 200)
        }
      }}
      onInsert={() => addFile(fileUrl, fileName)}
      onToggleClick={() => setIsFileDialogOpen(true)}
    />
  )
})
