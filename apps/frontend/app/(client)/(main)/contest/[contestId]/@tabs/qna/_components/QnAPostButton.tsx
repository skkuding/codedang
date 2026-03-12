'use client'

import { AlertModal } from '@/components/AlertModal'
import { Button } from '@/components/shadcn/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BiSolidPencil } from 'react-icons/bi'

type QnAPostButtonProps = {
  section: 'contest' | 'course'
  hrefId: number
  canCreateQnA: boolean | null
}

export function QnAPostButton({
  section,
  hrefId,
  canCreateQnA
}: QnAPostButtonProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <Button
        type="button"
        onClick={() =>
          canCreateQnA
            ? router.push(`/${section}/${hrefId}/qna/create`)
            : setModalOpen(true)
        }
        className="flex h-[46px] w-[120px] flex-[1_0_0] items-center justify-center gap-[6px] px-6 py-3 text-base font-medium tracking-[-0.48px]"
      >
        <BiSolidPencil className="white w-4" />
        Post
      </Button>
      <AlertModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="sm"
        type="warning"
        showCancelButton={false}
        title="Access Denied"
        description={
          'You are not authorized to access this page.\nPlease check your account permissions.'
        }
        primaryButton={{
          text: 'Confirm',
          onClick: () => setModalOpen(false),
          variant: 'default'
        }}
      />
    </>
  )
}
