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
import Image from 'next/image'
import type { Dispatch, SetStateAction } from 'react'
import { ModalInput } from './ModalInput'

interface ModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  size: 'small' | 'middle' | 'large'
  type: 'confirm' | 'input' | 'warning' | 'custom'
  inputType?: string
  inputValue?: string // 이거맞나...?
  setInput?: Dispatch<SetStateAction<string>>
  inputPlaceholder?: string
  title: string
  description?: string
  primaryButtonText?: string // ex) "Register", "Delete"
  secondaryButtonText?: string // ex) "Cancel"
  primaryButtonAction?: () => void
  secondaryButtonAction?: () => void
  itemsNode?: React.ReactNode[]
  onClose?: () => void
}

const sizeClassMap = {
  small: 'w-[424px] h-[280px]  p-[40px]',
  middle: 'w-[600px] h-[580px] p-[50px]',
  large: 'w-[800px] h-[620px] p-[50px]'
}

export function Modal({
  open,
  onOpenChange,
  size,
  type,
  inputType,
  inputValue,
  setInput,
  inputPlaceholder,
  title,
  description,
  primaryButtonText,
  secondaryButtonText,
  primaryButtonAction,
  secondaryButtonAction,
  itemsNode,
  onClose
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          sizeClassMap[size],
          'flex flex-col items-center justify-center !rounded-2xl'
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
        {type === 'input' &&
          inputType &&
          inputPlaceholder &&
          typeof inputValue === 'string' &&
          setInput && (
            <ModalInput
              type={inputType}
              placeholder={inputPlaceholder}
              input={inputValue}
              setInput={setInput}
            />
          )}
        {itemsNode && itemsNode}
        {description && (
          <p
            className={cn(
              'w-full text-center text-sm font-normal text-[#737373]',
              itemsNode && 'text-left'
            )}
          >
            {description}
          </p>
        )}
        <DialogFooter className="flex w-full justify-center gap-[4px]">
          {secondaryButtonText && secondaryButtonAction && (
            <Button
              onClick={secondaryButtonAction}
              className="h-[46px] w-full"
              variant="outline"
            >
              {secondaryButtonText}
            </Button>
          )}
          {primaryButtonText && primaryButtonAction && (
            <Button onClick={primaryButtonAction} className="h-[46px] w-full">
              {primaryButtonText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
