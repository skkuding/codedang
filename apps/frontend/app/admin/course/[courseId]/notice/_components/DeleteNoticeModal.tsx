'use client'

import { AlertModal } from '@/components/AlertModal'

interface DeleteNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDelete: () => void
  isDeleting?: boolean
}

export function DeleteNoticeModal({
  open,
  onOpenChange,
  onDelete,
  isDeleting = false
}: DeleteNoticeModalProps) {
  return (
    <AlertModal
      open={open}
      onOpenChange={onOpenChange}
      size="sm"
      type="warning"
      title="Delete notice?"
      description={
        'Are you sure you want to delete this notice?\nThis action cannot be undone.'
      }
      primaryButton={{
        text: isDeleting ? 'Deleting...' : 'Delete',
        onClick: onDelete
      }}
      onClose={() => onOpenChange(false)}
    />
  )
}
