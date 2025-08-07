'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import infoIcon from '@/public/icons/info.svg'
import Image from 'next/image'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './shadcn/alert-dialog'

interface ButtonProps {
  text: string
  onClick: () => void
  variant?: 'default' | 'outline'
}

interface AlertModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  type: 'confirm' | 'warning'
  showWarningIcon?: boolean
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
  type,
  showWarningIcon = true,
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
        className="rounded-2xl! flex h-[280px] w-[424px] flex-col items-center justify-center p-[40px]"
        onEscapeKeyDown={onClose}
      >
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          {type === 'warning' && showWarningIcon && (
            <Image
              src={infoIcon}
              alt="info"
              width={42}
              height={42}
              // className="mb-3"
            />
          )}
          <AlertDialogTitle className="text-center text-2xl font-semibold">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        {children}
        {description && (
          <p
            className={cn(
              'w-full text-center text-sm font-normal text-[#737373]',
              children && 'text-left'
            )}
          >
            {description}
          </p>
        )}
        <AlertDialogFooter className="mt-auto flex w-full justify-center gap-[4px]">
          <AlertDialogCancel className="h-[46px] w-full">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={primaryButton.onClick}
              className={cn(
                'h-[46px] w-full',
                type === 'warning' ? 'bg-error hover:bg-red-500/90' : null
              )}
              variant={primaryButton.variant}
            >
              {primaryButton.text}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
