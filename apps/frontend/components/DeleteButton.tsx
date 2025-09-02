'use client'

import { useState, type ReactNode } from 'react'
import { AlertModal } from './AlertModal'

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
