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
import type {
  BlueprintNoticeDraft,
  BlueprintNoticeSection
} from '../_libs/noticeTypes'

interface Props {
  open: boolean
  editing: boolean
  values: BlueprintNoticeDraft
  original: BlueprintNoticeDraft
  sections: readonly BlueprintNoticeSection[]
  onCancel: () => void
  onConfirm: () => void
  onRestoreFocus: () => void
}

export function BlueprintNoticeConfirmation({
  open,
  editing,
  values,
  original,
  sections,
  onCancel,
  onConfirm,
  onRestoreFocus
}: Props) {
  const changes = [
    values.title !== original.title && 'Title',
    values.content !== original.content && 'Main Text'
  ].filter(Boolean)
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent
        hideCloseButton
        className="flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[600px] flex-col gap-6 overflow-y-auto rounded-2xl px-6 py-10 sm:px-10"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onRestoreFocus()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-[24px] font-semibold leading-[1.3] tracking-[-0.72px]">
            {editing
              ? '변경사항을 저장할까요?'
              : `${values.sectionGroupIds.length}개 분반에 저장할까요?`}
          </DialogTitle>
          <DialogDescription>
            Review the {editing ? 'linked' : 'selected'} sections. Notice saving
            is not connected.
          </DialogDescription>
        </DialogHeader>
        {editing && (
          <div className="text-body2_m_14 flex max-h-60 flex-col gap-3 overflow-y-auto break-words rounded-xl border p-4">
            <p>
              {changes.length
                ? `Changed: ${changes.join(', ')}`
                : 'No content changes.'}
            </p>
            {values.title !== original.title && (
              <div>
                <h3 className="font-semibold">Title</h3>
                <p>Before: {original.title}</p>
                <p>After: {values.title}</p>
              </div>
            )}
            {values.content !== original.content && (
              <div>
                <h3 className="font-semibold">Main Text</h3>
                <p>Before: {original.content.replace(/<[^>]*>/g, '')}</p>
                <p>After: {values.content.replace(/<[^>]*>/g, '')}</p>
                {original.content.replace(/<[^>]*>/g, '') ===
                  values.content.replace(/<[^>]*>/g, '') && (
                  <p>Formatting or embedded content has changed.</p>
                )}
              </div>
            )}
          </div>
        )}
        <ul className="text-body2_m_14 flex max-h-60 flex-col gap-3 overflow-y-auto rounded-xl bg-[#F5F5F5] p-5">
          {values.sectionGroupIds.map((id) => (
            <li key={id}>
              {sections.find((section) => section.groupId === id)
                ?.sectionLabel ?? `Section #${id}`}
            </li>
          ))}
          {values.sectionGroupIds.length === 0 && <li>No linked sections.</li>}
        </ul>
        <DialogFooter className="gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
