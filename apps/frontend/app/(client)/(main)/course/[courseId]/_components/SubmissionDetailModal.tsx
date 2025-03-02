'use client'

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'

export function SubmissionDetailModal() {
  return (
    <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
      <DialogHeader>
        <DialogTitle>Submission Detail</DialogTitle>
      </DialogHeader>
      <DialogDescription>description</DialogDescription>
    </DialogContent>
  )
}
