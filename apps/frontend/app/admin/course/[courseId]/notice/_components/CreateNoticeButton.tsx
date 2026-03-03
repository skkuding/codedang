'use client'

import { Button } from '@/components/shadcn/button'
import { useState } from 'react'
import { FaPen } from 'react-icons/fa6'
import { CreateNoticeModal } from './CreateNoticeModal'

interface CreateNoticeButtonProps {
  courseId: string
}

export function CreateNoticeButton({ courseId }: CreateNoticeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button
        variant="default"
        className="h-[46px] w-[126px] rounded-full bg-[#3581FA] px-6 py-[10px] hover:bg-[#3581FA]/90"
        onClick={() => setIsModalOpen(true)}
      >
        <FaPen className="mr-2 h-5 w-5" />
        <span className="text-[18px] font-medium leading-[140%] tracking-[-0.03em]">
          Create
        </span>
      </Button>
      <CreateNoticeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        courseId={courseId}
      />
    </>
  )
}
