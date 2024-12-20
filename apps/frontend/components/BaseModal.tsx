import { Loader2 } from 'lucide-react'
import React, { Fragment, type ReactNode } from 'react'
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
  modalBgDarkMode?: boolean
}

/**
 *
 * @remarks
 * * Use BaseModal Component by creating a new component(which includes 'AlertDialogFooter') that extends BaseModal
 * * AlertDialogFooter section (Button section) is separated using ConfirmModal component
 * because its design and functionality vary depending on context (for reusability).
 */
export default function BaseModal({
  open,
  handleClose,
  children,
  loading = false,
  loadingMessage = '',
  title = '',
  description = '',
  modalBgDarkMode = false
}: BaseModalProps) {
  const formattedDescription =
    description.split('\n').map((line, index) => (
      <Fragment key={index}>
        {line}
        <br />
      </Fragment>
    )) ?? ''

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogOverlay darkMode={modalBgDarkMode} />
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
