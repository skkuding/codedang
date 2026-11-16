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
import BulletIcon from '@/public/icons/blueprint-create-bullet.svg'
import LinkIcon from '@/public/icons/blueprint-create-link.svg'
import type {
  BlueprintCreateDraft,
  BlueprintCreateOptions
} from '../_libs/createTypes'

interface BlueprintCreateConfirmationProps {
  open: boolean
  draft: BlueprintCreateDraft
  options: BlueprintCreateOptions
  onConfirm: () => void
  onCancel: () => void
  onRestoreFocus: () => void
}

export function BlueprintCreateConfirmation({
  open,
  draft,
  options,
  onConfirm,
  onCancel,
  onRestoreFocus
}: BlueprintCreateConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent
        hideCloseButton
        className="flex h-[580px] max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[600px] flex-col gap-4 overflow-y-auto rounded-2xl border-0 px-6 py-10 sm:rounded-2xl sm:px-10 sm:py-[50px]"
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onRestoreFocus()
        }}
      >
        <DialogHeader className="shrink-0 items-center gap-7 space-y-0">
          <DialogTitle className="text-center text-[24px] font-semibold leading-[1.3] tracking-[-0.72px]">
            {draft.sections.length}개 분반에 저장할까요?
          </DialogTitle>
          <DialogDescription className="text-primary text-sub4_sb_14 flex w-full items-center gap-1.5 rounded-lg bg-[#EAF3FF] px-[18px] py-2 text-left">
            <LinkIcon aria-hidden="true" className="shrink-0" />
            선택한 분반과 일정을 확인하세요. 실제 생성 API는 아직 연결되지
            않았습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="h-[294px] min-h-0 overflow-y-auto rounded-[10px] bg-[#F5F5F5] p-5">
          <ul className="flex flex-col gap-3">
            {draft.sections.map((section) => (
              <li
                key={section.groupId}
                className="text-body2_m_14 flex items-start gap-1 break-words"
              >
                <BulletIcon aria-hidden="true" className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p>
                    {options.sections.find(
                      (item) => item.groupId === section.groupId
                    )?.sectionLabel ?? String(section.groupId)}
                  </p>
                  <p className="border-line mt-2 rounded-lg border bg-white px-3 py-2">
                    {section.startTime.replace('T', ' ')} →{' '}
                    {section.endTime.replace('T', ' ')} (Asia/Seoul)
                  </p>
                  <p className="mt-1">
                    Due:{' '}
                    {section.dueTime
                      ? section.dueTime.replace('T', ' ')
                      : 'None'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter className="mt-auto flex-row justify-center gap-2 sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="h-[38px] rounded-lg px-4 text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className="h-[38px] rounded-lg px-4 text-sm"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
