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
import type { Dispatch, SetStateAction } from 'react'
import { Button } from './shadcn/button'
import { Toggle } from './shadcn/toggle'

interface InsertDialogProps {
  editor: Editor | null
  activeType: string
  triggerIcon: React.ReactNode
  title: string
  description: React.ReactNode
  open?: boolean
  onOpenChange?: Dispatch<SetStateAction<boolean>>
  onInsert?: () => void
  onToggleClick?: () => void
}

export function InsertDialog({
  editor,
  activeType,
  title,
  description,
  triggerIcon,
  open,
  onOpenChange,
  onInsert,
  onToggleClick
}: InsertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild onClick={onToggleClick}>
        <Toggle
          className="h-9 w-9 p-1"
          pressed={editor?.isActive({ activeType })}
        >
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
