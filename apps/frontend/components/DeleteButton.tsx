'use client'

import { useState, type ReactNode } from 'react'
import { FaTrash } from 'react-icons/fa6'
import { AlertModal } from './AlertModal'
import { Button } from './shadcn/button'

export function DeleteButton({
  subject,
  handleDelete,
  trigger
}: {
  subject: string
  handleDelete: () => void
  trigger: ReactNode
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <AlertModal
      trigger={trigger}
      open={showModal}
      onOpenChange={(open) => setShowModal(open)}
      size="sm"
      type="warning"
      title={`Delete ${subject.toUpperCase().slice(0, 1).concat(subject.toLowerCase().slice(1))}?`}
      description={`Are you sure you want to delete this ${subject.toLowerCase()}?\nOnce deleted, it cannot be recovered.`}
      primaryButton={{
        text: 'Delete',
        onClick: () => {
          handleDelete()
          setShowModal(false)
        },
        variant: 'default'
      }}
      onClose={() => setShowModal(false)}
    />
  )
}

// <Button
//   variant="outline"
//   className="cursor-pointer border-[1px] border-[#FC5555] hover:bg-red-100"
//   asChild
// >
//   <div className="flex h-[36px] items-center gap-[6px] px-[24px] py-[8px] text-[#FC5555]">
//     <FaTrash fontSize={16} />
//     <p className="text-sm font-medium tracking-[-3%]">Delete</p>
//   </div>
// </Button>
