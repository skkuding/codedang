'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { PlagiarismCodeComparisonView } from './PlagiarismCodeComparisonView'
import type { PlagiarismResult } from './PlagiarismResultTableColumns'

interface PlagiarismCodeComparisonDialogProps {
  result: PlagiarismResult
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: number
}

export function PlagiarismCodeComparisonDialog({
  result,
  open,
  onOpenChange,
  groupId
}: PlagiarismCodeComparisonDialogProps) {
  const similarityPercent = (result.averageSimilarity * 100).toFixed(2)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] max-w-[95vw] flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Code comparison — Similarity: {similarityPercent}%
          </DialogTitle>
        </DialogHeader>
        <PlagiarismCodeComparisonView
          result={result}
          active={open}
          groupId={groupId}
        />
      </DialogContent>
    </Dialog>
  )
}
