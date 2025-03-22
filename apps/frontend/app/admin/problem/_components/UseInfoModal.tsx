'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { useState } from 'react'
import { FaFileCircleExclamation } from 'react-icons/fa6'

interface UseInfoModalProps {
  problemId: number
}

export function UseInfoModal({ problemId }: UseInfoModalProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Button
        asChild
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          setIsDialogOpen(true)
        }}
        className="bg-transparent p-0 hover:bg-transparent"
      >
        <FaFileCircleExclamation size={24} color="#B0B0B0" />
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="p-14 sm:max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2 text-lg font-medium">
                <span>Problem Use Information</span>
              </div>
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
