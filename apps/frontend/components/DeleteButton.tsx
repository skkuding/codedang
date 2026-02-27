'use client'

import { useState, type ReactNode } from 'react'
import { HiTrash } from 'react-icons/hi'
import { AlertModal } from './AlertModal'
import { Button } from './shadcn/button'

export function DeleteButton({
  subject,
  type = 'default',
  handleDelete,
  trigger
}: {
  subject: string
  type?: 'default' | 'compact'
  handleDelete: () => void
  trigger?: ReactNode
}) {
  const [showModal, setShowModal] = useState(false)

  return (
    <AlertModal
      trigger={trigger ?? triggers[type]}
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

const triggers = {
  default: (
    <Button
      variant="outline"
      className="border-primary hover:bg-color-blue-90 cursor-pointer rounded-sm border-[1px]"
      asChild
    >
      <div className="text-primary flex h-auto items-center justify-center gap-[4px] px-[10px] py-[6px]">
        <HiTrash fontSize={20} />
        <p className="text-body2_m_14">Delete</p>
      </div>
    </Button>
  ),
  compact: (
    <Button
      variant="outline"
      className="bg-color-neutral-99 hover:bg-fill-neutral border-color-neutral-90 w-13 h-10 cursor-pointer"
      asChild
    >
      <div className="text-color-neutral-70 grid place-content-center px-4 py-[10px]">
        <HiTrash fontSize={24} />
      </div>
    </Button>
  )
}
