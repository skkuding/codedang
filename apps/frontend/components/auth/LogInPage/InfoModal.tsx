'use client'

import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { cn } from '@/libs/utils'
import Image from 'next/image'
import { useState } from 'react'

interface InfoModalButton {
  text: string
  onClick: () => void
}

interface InfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  primaryButton: InfoModalButton
  secondaryButton?: InfoModalButton
  className?: string
  dismissForTodayLabel?: string
  onDismissForToday?: () => void
}

export function InfoModal({
  open,
  onOpenChange,
  title,
  description,
  primaryButton,
  secondaryButton,
  className,
  dismissForTodayLabel,
  onDismissForToday
}: InfoModalProps) {
  const [hideToday, setHideToday] = useState(false)

  const withDismissCheck = (onClick: () => void) => () => {
    if (hideToday) {
      onDismissForToday?.()
    }
    onClick()
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'inline-flex w-[456px] flex-col items-start gap-6 !rounded-2xl border-none bg-white px-8 pb-6 pt-8 shadow-lg',
          className
        )}
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogHeader className="flex flex-col items-start gap-2 space-y-0">
          <Image
            src="/icons/icon-info-blue.svg"
            alt="info"
            width={42}
            height={42}
          />

          <div className="flex flex-col gap-2">
            <DialogTitle className="text-head5_sb_24 whitespace-pre-wrap text-left">
              {title}
            </DialogTitle>

            {description && (
              <p className="text-body1_m_16 text-left text-[#474747]">
                {description}
              </p>
            )}
          </div>
        </DialogHeader>

        <DialogFooter className="flex w-full flex-col gap-3 sm:flex-col">
          <div className="flex w-full flex-row gap-3">
            {secondaryButton && (
              <Button
                type="button"
                onClick={withDismissCheck(secondaryButton.onClick)}
                className="border-primary text-sub3_sb_16 text-primary h-[50px] flex-1 rounded-xl border bg-white hover:bg-blue-50"
              >
                {secondaryButton.text}
              </Button>
            )}

            <Button
              type="button"
              onClick={withDismissCheck(primaryButton.onClick)}
              className="bg-primary text-sub3_sb_16 h-[50px] flex-1 rounded-xl"
            >
              {primaryButton.text}
            </Button>
          </div>

          {dismissForTodayLabel && onDismissForToday && (
            <label className="flex items-center gap-2">
              <Checkbox
                checked={hideToday}
                onCheckedChange={(checked) => setHideToday(checked === true)}
              />
              <span className="text-caption2_m_12 text-[#474747]">
                {dismissForTodayLabel}
              </span>
            </label>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
