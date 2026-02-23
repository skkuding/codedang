'use client'

import { useTranslate } from '@tolgee/react'
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
  const { t } = useTranslate()

  return (
    <AlertModal
      trigger={trigger ?? triggers(t)[type]}
      open={showModal}
      onOpenChange={(open) => setShowModal(open)}
      size="sm"
      type="warning"
      title={t('delete_modal_title', {
        subject: subject
          .toUpperCase()
          .slice(0, 1)
          .concat(subject.toLowerCase().slice(1))
      })}
      description={t('delete_modal_description', {
        subject: subject.toLowerCase()
      })}
      primaryButton={{
        text: t('delete_button_primary'),
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

const triggers = (t: (key: string) => string) => ({
  default: (
    <Button
      variant="outline"
      className="border-primary hover:bg-color-blue-90 cursor-pointer rounded-sm border-[1px]"
      asChild
    >
      <div className="text-primary flex h-auto items-center justify-center gap-[4px] px-[10px] py-[6px]">
        <HiTrash fontSize={20} />
        <p className="text-sm font-medium tracking-[-3%]">
          {t('delete_button_text')}
        </p>
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
})
