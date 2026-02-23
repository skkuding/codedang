'use client'

import { Modal } from '@/components/Modal'
import { useTranslate } from '@tolgee/react'
import { Loader2 } from 'lucide-react'

interface ZipUploadModalProps {
  isOpen: boolean
}

export function ZipUploadModal({ isOpen }: ZipUploadModalProps) {
  const { t } = useTranslate()

  return (
    <Modal
      open={isOpen}
      onOpenChange={() => {}}
      size="sm"
      type="custom"
      title={t('uploading_zip_files_title')}
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-color-neutral-50 text-sm">
          {t('uploading_zip_files_message')}
        </p>
      </div>
    </Modal>
  )
}
