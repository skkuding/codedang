'use client'

import { BaseModal } from '@/components/BaseModal'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { IoIosCloseCircle } from 'react-icons/io'
import { IoSearchCircle } from 'react-icons/io5'

interface ModalProps {
  open?: boolean
  handleOpen?: () => void
  handleClose?: () => void
  confirmAction?: () => void
  title?: string
  description?: string
  url: string
}

export function BiggerImageButton({ url }: ModalProps) {
  const { t } = useTranslate()
  const [openModal, setOpenModal] = useState(false)

  const OpenModal = () => setOpenModal(true)
  const CloseModal = () => setOpenModal(false)

  const modalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setOpenModal(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openModal])

  return (
    <>
      <IoSearchCircle onClick={OpenModal} className="h-8 w-8" />
      <BaseModal
        open={openModal}
        darkMode={false}
        modalstyle="max-w-[468px] max-h-[624px] p-0 gap-0 border-0 sm:rounded-2xl"
        headerstyle="space-y-0"
      >
        <div ref={modalRef} className="relative mt-0">
          <Image
            src={url}
            alt={t('contest_poster_alt_text')}
            width={468}
            height={624}
            className="h-[624px] w-[468px] rounded-2xl border-0 object-contain"
          />
          <IoIosCloseCircle
            color="#3333334D"
            onClick={CloseModal}
            className="absolute right-[15px] top-4 h-12 w-12 cursor-pointer"
          />
        </div>
      </BaseModal>
    </>
  )
}
