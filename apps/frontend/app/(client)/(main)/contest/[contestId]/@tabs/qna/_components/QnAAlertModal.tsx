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
import blueWarningIcon from '@/public/icons/info-blue.svg'
import Image from 'next/image'
import { useState } from 'react'

interface ButtonProps {
  text: string
  onClick: () => void
  variant?: 'default' | 'outline'
}

interface AlertModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showCancelButton?: boolean
  title: string
  description?: string
  primaryButton: ButtonProps
  children?: React.ReactNode
  onClose?: () => void
}

const sizeClassMap = {
  sm: '!w-[424px] !h-[280px] !p-[40px]',
  md: '!w-[600px] !h-[580px] !py-[50px] !px-[40px]',
  lg: '!w-[800px] !h-[620px] !py-[50px] !px-[40px]'
}

export function AlertModal({
  trigger,
  open,
  onOpenChange,
  size = 'sm',
  showIcon = true,
  showCancelButton = true,
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
        className={cn(
          sizeClassMap[size],
          'flex flex-col items-center justify-center !rounded-2xl'
        )}
        onEscapeKeyDown={onClose}
      >
        <AlertDialogHeader className="flex flex-col items-center justify-center">
          {showIcon && (
            <Image
              src={blueWarningIcon}
              alt={'warning'}
              width={50}
              height={50}
            />
          )}
          <AlertDialogTitle
            className={cn(
              'w-full text-2xl font-semibold',
              size === 'lg' ? 'text-left' : 'text-center'
            )}
          >
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
          {showCancelButton && (
            <AlertDialogCancel className="h-[46px] w-full">
              Cancel
            </AlertDialogCancel>
          )}
          <AlertDialogAction asChild>
            <Button
              onClick={primaryButton.onClick}
              className="h-[46px] w-full"
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
