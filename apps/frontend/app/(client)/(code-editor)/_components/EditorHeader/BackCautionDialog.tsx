import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/shadcn/alert-dialog'
import type { MutableRefObject } from 'react'

interface BackCautionDialogProps {
  confrim: MutableRefObject<boolean>
  isOpen: boolean
  title: string
  description: string
  onClose: () => void
  onBack: () => void
}

export function BackCautionDialog({
  confrim,
  isOpen,
  title,
  description,
  onClose,
  onBack
}: BackCautionDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="gap-6">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm">
          <AlertDialogAction
            onClick={() => window.history.pushState(null, '', '')}
            className="border border-neutral-300 bg-white text-neutral-400 hover:bg-neutral-200"
          >
            Cancel
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => {
              confrim.current = true
              onBack()
            }}
          >
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
