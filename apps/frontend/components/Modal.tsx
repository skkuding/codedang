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
import infoIcon from '@/public/icons/info.svg'
import { DialogTrigger } from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useState } from 'react'
import { ModalInput } from './ModalInput'

export interface InputProps {
  type: string
  placeholder: string
  value: string
  onChange: (val: string) => void
}

interface ButtonProps {
  text: string
  onClick: () => void
  variant?: 'default' | 'outline-solid'
}

interface ModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  size: 'sm' | 'md' | 'lg'
  type: 'input' | 'warning' | 'custom'
  title: string
  headerDescription?: string
  footerDescription?: string
  inputProps?: InputProps
  primaryButton?: ButtonProps
  secondaryButton?: ButtonProps
  children?: React.ReactNode
  onClose?: () => void
}

const sizeClassMap = {
  sm: 'w-[424px]! h-[280px]! p-[40px]!',
  md: 'w-[600px]! h-[580px]! py-[50px]! px-[40px]!',
  lg: 'w-[800px]! h-[620px]! py-[50px]! px-[40px]!'
}

export function Modal({
  trigger,
  open,
  onOpenChange,
  size,
  type,
  title,
  headerDescription,
  footerDescription,
  inputProps,
  primaryButton,
  secondaryButton,
  children,
  onClose
}: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const actualOpen = isControlled ? open : internalOpen
  const handleOpenChange = isControlled ? onOpenChange : setInternalOpen
  return (
    <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          sizeClassMap[size],
          'rounded-2xl! flex flex-col items-center justify-center'
        )}
        onPointerDownOutside={onClose}
        onEscapeKeyDown={onClose}
      >
        <DialogHeader className="flex flex-col items-center justify-center">
          {type === 'warning' && (
            <Image
              src={infoIcon}
              alt="info"
              width={42}
              height={42}
              // className="mb-3"
            />
          )}
          <DialogTitle className="text-center text-2xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        {type === 'input' && inputProps && (
          <ModalInput
            type={inputProps.type}
            placeholder={inputProps.placeholder}
            value={inputProps.value}
            onChange={inputProps.onChange}
          />
        )}
        {headerDescription && (
          <p
            className={cn(
              'w-full text-center text-sm font-normal text-[#737373]',
              children && 'text-left'
            )}
          >
            {headerDescription}
          </p>
        )}
        {children}
        {footerDescription && (
          <p
            className={cn(
              'w-full text-center text-sm font-normal text-[#737373]',
              children && 'text-left'
            )}
          >
            {footerDescription}
          </p>
        )}
        <DialogFooter className="flex w-full justify-center gap-[4px]">
          {secondaryButton && (
            <Button
              onClick={secondaryButton.onClick}
              className="h-[46px] w-full"
              variant={secondaryButton.variant}
            >
              {secondaryButton.text}
            </Button>
          )}
          {primaryButton && (
            <Button
              onClick={primaryButton.onClick}
              className="h-[46px] w-full"
              variant={primaryButton.variant}
            >
              {primaryButton.text}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
