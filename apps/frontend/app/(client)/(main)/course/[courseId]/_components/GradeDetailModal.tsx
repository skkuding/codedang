'use client'

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'

export function GradeDetailModal() {
  return (
    <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
      <DialogHeader>
        <DialogTitle>Grade Detail</DialogTitle>
      </DialogHeader>
      <DialogDescription>description</DialogDescription>
    </DialogContent>
  )
}
