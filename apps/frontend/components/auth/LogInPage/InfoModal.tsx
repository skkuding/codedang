'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { cn } from '@/libs/utils'
import infoIcon from '@/public/icons/icon-info-blue.svg'
import Image from 'next/image'

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
}

export function InfoModal({
  open,
  onOpenChange,
  title,
  description,
  primaryButton,
  secondaryButton,
  className
}: InfoModalProps) {
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
          <Image src={infoIcon} alt="info" width={42} height={42} />

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

        <DialogFooter className="flex w-full flex-row gap-3 sm:justify-start">
          {secondaryButton && (
            <Button
              type="button"
              onClick={secondaryButton.onClick}
              className="border-primary text-sub3_sb_16 text-primary h-[50px] flex-1 rounded-xl border bg-white hover:bg-blue-50"
            >
              {secondaryButton.text}
            </Button>
          )}

          <Button
            type="button"
            onClick={primaryButton.onClick}
            className="bg-primary text-sub3_sb_16 h-[50px] flex-1 rounded-xl"
          >
            {primaryButton.text}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
