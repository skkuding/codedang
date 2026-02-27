'use client'

import { Modal } from '@/components/Modal'
import { Loader2 } from 'lucide-react'

interface ZipUploadModalProps {
  isOpen: boolean
}

export function ZipUploadModal({ isOpen }: ZipUploadModalProps) {
  return (
    <Modal
      open={isOpen}
      onOpenChange={() => {}}
      size="sm"
      type="custom"
      title="Uploading testcase ZIP files"
    >
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-color-neutral-50 text-body4_r_14">
          Uploading testcase ZIP files to the server.
        </p>
      </div>
    </Modal>
  )
}
