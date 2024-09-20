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
} from '@/components/ui/dialog'
import type { Editor } from '@tiptap/core'
import React from 'react'
import { Button } from './ui/button'
import { Toggle } from './ui/toggle'

interface InsertDialogProps {
  editor: Editor | null
  activeType: string
  triggerIcon: React.ReactNode
  title: string
  description: React.ReactNode
  onInsert?: () => void
  onToggleClick?: () => void
}

export default function InsertDialog({
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
