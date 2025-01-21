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
  children?: ReactNode
  loading?: boolean
  loadingMessage?: string
  title?: string
  description?: string
  darkMode?: boolean
}

/**
 *
 * @remarks
 * * Use BaseModal Component by creating a new component(which includes 'AlertDialogFooter') that extends BaseModal.
 * * AlertDialogFooter section (Button section) is separated using ConfirmModal component for reusability.
 */
export function BaseModal({
  open,
  handleClose,
  children,
  loading = false,
  loadingMessage = '',
  title = '',
  description = '',
  darkMode = false
}: BaseModalProps) {
  const formattedDescription =
    description.split('\n').map((line, index) => <p key={index}>{line}</p>) ??
    ''

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogOverlay darkMode={darkMode} />
      <AlertDialogContent className="max-w-[428px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="min-w-72">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin" />
                <span className="mt-2 text-sm">{loadingMessage}</span>
              </div>
            ) : (
              formattedDescription
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {children}
      </AlertDialogContent>
    </AlertDialog>
  )
}
