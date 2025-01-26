'use client'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import type { Editor } from '@tiptap/core'
import { Button } from './shadcn/button'
import { Toggle } from './shadcn/toggle'

interface InsertDialogProps {
  editor: Editor | null
  activeType: string
  triggerIcon: React.ReactNode
  title: string
  description: React.ReactNode
  onInsert?: () => void
  onToggleClick?: () => void
}

export function InsertDialog({
  editor,
  activeType,
  title,
  description,
  triggerIcon,
  onInsert,
  onToggleClick
}: InsertDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild onClick={onToggleClick}>
        <Toggle size="sm" pressed={editor?.isActive({ activeType })}>
          {triggerIcon}
        </Toggle>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter>
          <DialogClose asChild>
            <Button onClick={onInsert}>Insert</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
