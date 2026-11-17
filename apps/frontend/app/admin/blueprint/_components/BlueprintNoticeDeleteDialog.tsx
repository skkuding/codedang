'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { useRef } from 'react'

export function BlueprintNoticeDeleteDialog({
  targets,
  onClose
}: {
  targets: readonly { id: number; title: string }[]
  onClose: () => void
}) {
  const returnFocus = useRef<HTMLElement | null>(null)
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[600px] flex-col gap-5 overflow-y-auto overflow-x-hidden rounded-2xl p-6 sm:rounded-2xl sm:p-10"
        onOpenAutoFocus={() => {
          returnFocus.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault()
            returnFocus.current.focus()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            Delete {targets.length} notice{targets.length === 1 ? '' : 's'}?
          </DialogTitle>
          <DialogDescription>
            Deletion effects on section copies are not confirmed. No content
            will be deleted.
          </DialogDescription>
        </DialogHeader>
        <ul className="flex flex-col gap-3">
          {targets.map((target) => (
            <li key={target.id} className="border-line rounded-lg border p-4">
              <span className="break-words">{target.title}</span>{' '}
              <span className="text-color-neutral-60">#{target.id}</span>
            </li>
          ))}
        </ul>
        <p role="alert">
          Notice deletion impact and permissions have not been confirmed.
        </p>
        <p role="status">
          Blueprint Notice deletion is not connected. No content has been
          deleted.
        </p>
        <DialogFooter className="flex-row justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
