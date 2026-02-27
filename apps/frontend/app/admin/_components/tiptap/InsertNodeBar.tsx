'use client'

import { InsertDialog } from '@/components/InsertDialog'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { Toggle } from '@/components/shadcn/toggle'
import { UPLOAD_IMAGE, UPLOAD_FILE } from '@/graphql/problem/mutations'
import CodeBlock from '@/public/icons/texteditor-codeblock.svg'
import SquareRadical from '@/public/icons/texteditor-equation.svg'
import Paperclip from '@/public/icons/texteditor-file.svg'
import ImagePlus from '@/public/icons/texteditor-image.svg'
import TableIcon from '@/public/icons/texteditor-table.svg'
import { useMutation } from '@apollo/client'
import type { Editor } from '@tiptap/react'
import {
  ArrowDownToLine,
  ArrowLeftFromLine,
  ArrowRightToLine,
  ArrowUpFromLine,
  Trash
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { forwardRef, useImperativeHandle } from 'react'
import { toast } from 'sonner'

export interface InsertNodeBarHandles {
  openFileDialog: () => void
  openImageDialog: () => void
  openTableDialog: () => void
}

interface InsertNodeBarProps {
  editor: Editor
}

export const InsertNodeBar = forwardRef<
  InsertNodeBarHandles,
  InsertNodeBarProps
>(function InsertNodeBar({ editor }, ref) {
  const [uploadImageMutation] = useMutation(UPLOAD_IMAGE)
  const [uploadFileMutation] = useMutation(UPLOAD_FILE)

  const [imageUrl, setImageUrl] = useState<string | undefined>('')
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | undefined>('')
  const [fileName, setFileName] = useState<string | undefined>('')
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const [tableSize, setTableSize] = useState({ rowCount: 3, columnCount: 3 })
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false)

  const addImage = useCallback(
    (url?: string) => {
      if (!url) {
        return
      }
      editor.chain().focus().setImage({ src: url }).run()
    },
    [editor]
  )

  const handleUploadPhoto = async (files: FileList | null) => {
    if (files === null) {
      return
    }
    const file = files[0]
    try {
      const { data } = await uploadImageMutation({
        variables: { input: { file } }
      })
      setImageUrl(data?.uploadImage.src ?? '')
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message
        if (errorMessage === 'File size exceeds maximum limit') {
          toast.error('Images larger than 5MB cannot be uploaded.')
        }
      }
    }
  }

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
    openFileDialog: () => setIsFileDialogOpen(true),
    openImageDialog: () => setIsImageDialogOpen(true),
    openTableDialog: () => setIsTableDialogOpen(true)
  }))

  return (
    <>
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
            <p className="text-body4_r_14"> * File must be under 30MB</p>
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
      <InsertDialog
        open={isImageDialogOpen}
        editor={editor}
        activeType="image"
        title="Upload Image"
        description={
          <>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleUploadPhoto(e.target.files)}
            />
            <p className="text-body4_r_14"> * Image must be under 5MB</p>
          </>
        }
        triggerIcon={
          <Image src={ImagePlus} alt="Image" className="h-[18px] w-[18px]" />
        }
        onOpenChange={(open) => {
          setIsImageDialogOpen(open)
          if (!open) {
            setTimeout(() => editor.commands.focus(), 200)
          }
        }}
        onInsert={() => addImage(imageUrl)}
        onToggleClick={() => setIsImageDialogOpen(true)}
      />
      <Toggle
        type="button"
        pressed={false}
        onClick={() => {
          editor
            .chain()
            .focus()
            .insertContent(`<math-component content=""></math-component>`)
            .run()
        }}
        className="h-9 w-9 p-2"
      >
        <Image
          src={SquareRadical}
          alt="Equation"
          className="h-[17px] w-[17px]"
        />
      </Toggle>
      <Toggle
        type="button"
        pressed={false}
        onClick={() => {
          editor.chain().focus().setCodeBlock().run()
        }}
        className="h-9 w-9 p-2"
      >
        <Image src={CodeBlock} alt="Code Block" className="h-[18px] w-5" />
      </Toggle>
      <Dialog
        open={isTableDialogOpen}
        onOpenChange={(open) => {
          setIsTableDialogOpen(open)
          if (!open) {
            setTimeout(() => editor.commands.focus(), 200)
          }
        }}
      >
        <DialogContent className="!w-fit">
          <DialogHeader>
            <DialogTitle>Insert Table</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <div className="my-4 flex w-32 items-center justify-between">
              <p>Row: </p>
              <Input
                type="number"
                className="h-8 w-16"
                value={tableSize.rowCount}
                onChange={(e) =>
                  setTableSize((prev) => ({
                    ...prev,
                    rowCount: Number(e.target.value)
                  }))
                }
              />
            </div>
            <div className="flex w-32 items-center justify-between">
              <p>Column: </p>
              <Input
                type="number"
                className="h-8 w-16"
                value={tableSize.columnCount}
                onChange={(e) =>
                  setTableSize((prev) => ({
                    ...prev,
                    columnCount: Number(e.target.value)
                  }))
                }
              />
            </div>
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={() => {
                  editor.commands.insertTable({
                    rows: tableSize.rowCount,
                    cols: tableSize.columnCount,
                    withHeaderRow: true
                  })
                }}
              >
                Insert
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Popover open={isTablePopoverOpen} onOpenChange={setIsTablePopoverOpen}>
        <PopoverTrigger asChild>
          <Toggle
            pressed={editor.isActive('table')}
            className="h-9 w-9 p-2"
            onPressedChange={(pressed) => {
              if (pressed) {
                setIsTableDialogOpen(true)
              } else {
                setIsTablePopoverOpen(true)
              }
            }}
          >
            <Image src={TableIcon} alt="Table" className="h-5 w-5" />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="flex w-fit p-1">
          <Button
            variant="ghost"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="h-7 w-7 p-1"
          >
            <ArrowDownToLine className="text-neutral-600" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="h-7 w-7 p-1"
          >
            <ArrowUpFromLine className="text-neutral-600" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="h-7 w-7 p-1"
          >
            <ArrowRightToLine className="text-neutral-600" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="h-7 w-7 p-1"
          >
            <ArrowLeftFromLine className="text-neutral-600" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              editor.chain().focus().deleteTable().run()
              setIsTablePopoverOpen(false)
            }}
            className="h-7 w-7 p-1"
          >
            <Trash className="text-neutral-600" />
          </Button>
        </PopoverContent>
      </Popover>
    </>
  )
})
