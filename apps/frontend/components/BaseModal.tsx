import { Loader2 } from 'lucide-react'
import React, { type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogTitle
} from './shadcn/alert-dialog'

interface BaseModalProps {
  open: boolean
  handleClose: () => void
  children?: React.ReactNode
  loading?: boolean
  loadingMessage?: string
  title?: string
  description?: ReactNode
}

export default function BaseModal({
  open,
  handleClose,
  children,
  loading = false,
  loadingMessage = '',
  title = '',
  description = ''
}: BaseModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogOverlay darkMode={false} />
      <AlertDialogContent className="max-w-[428px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin" />
                <span className="mt-2 text-sm">{loadingMessage}</span>
              </div>
            ) : (
              <>{description}</>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
      </AlertDialogContent>
    </AlertDialog>
  )
}
