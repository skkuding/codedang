'use client'

import { Button } from '@/components/shadcn/button'
import { useState } from 'react'
import { ImportNoticeModal } from './ImportNoticeModal'

interface ImportNoticeButtonProps {
  courseId: string
}

export function ImportNoticeButton({ courseId }: ImportNoticeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="h-[46px] w-[126px] rounded-full border border-[#3581FA] px-6 py-[10px] text-[#3581FA] hover:bg-[#3581FA]/10"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="text-[18px] font-medium leading-[140%] tracking-[-0.03em]">
          + Import
        </span>
      </Button>
      <ImportNoticeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        courseId={courseId}
      />
    </>
  )
}
