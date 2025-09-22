'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import warningIcon from '@/public/icons/info.svg'
import Image from 'next/image'
import { useState } from 'react'

interface ButtonProps {
  text: string
  onClick: () => void
}

interface AlertModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  primaryButton: ButtonProps
  children?: React.ReactNode
  onClose?: () => void
}

export function AlertModal({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  primaryButton,
  children,
  onClose
}: AlertModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const actualOpen = isControlled ? open : internalOpen
  const handleOpenChange = isControlled ? onOpenChange : setInternalOpen
  return (
    <AlertDialog open={actualOpen} onOpenChange={handleOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent
        className="flex !h-[300px] !w-[424px] flex-col items-center justify-center !rounded-2xl !p-[40px]"
        onEscapeKeyDown={onClose}
      >
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          <Image src={warningIcon} alt="warning" width={42} height={42} />
          <AlertDialogTitle className="w-full text-center text-2xl font-semibold">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        {children}
        <AlertDialogDescription>
          {description && (
            <p
              className={cn(
                'w-full whitespace-pre-wrap text-center text-sm font-normal text-[#737373]',
                children && 'text-left'
              )}
            >
              {description}
            </p>
          )}
        </AlertDialogDescription>
        <AlertDialogFooter className="flex w-full justify-center gap-[4px]">
          <AlertDialogCancel className="h-[46px] w-full">
            Go Back
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={primaryButton.onClick}
              className="bg-error h-[46px] w-full hover:bg-red-500/90"
              variant="default"
            >
              {primaryButton.text}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
