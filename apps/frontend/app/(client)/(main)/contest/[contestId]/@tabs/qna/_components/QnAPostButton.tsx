'use client'

import { AlertModal } from '@/components/AlertModal'
import { Button } from '@/components/shadcn/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { BiSolidPencil } from 'react-icons/bi'

type QnAPostButtonProps = {
  canCreateQnA: boolean
  href: string
  className?: string
}

export function QnAPostButton({
  canCreateQnA,
  href,
  className
}: QnAPostButtonProps) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <>
      <Button
        type="button"
        onClick={() => (canCreateQnA ? router.push(href) : setModalOpen(true))}
        className={className}
      >
        <BiSolidPencil className="white w-4" />
        Post
      </Button>
      <AlertModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="sm"
        type="warning"
        title="Access Denied"
        description="You are not authorized to access this page.\nPlease check your account permissions."
        primaryButton={{
          text: 'Delete',
          onClick: () => setModalOpen(false),
          variant: 'default'
        }}
      />
    </>
  )
}
