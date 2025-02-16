'use client'

import { BaseModal } from '@/components/BaseModal'
import { Button } from '@/components/shadcn/button'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { AiFillCloseSquare } from 'react-icons/ai'
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
      <IoSearchCircle onClick={OpenModal} className="h-6 w-6" />
      <BaseModal
        open={openModal}
        darkMode={false}
        modalstyle="max-w-[468px] max-h-[624px] p-0 gap-0 border-0"
        headerstyle="space-y-0"
      >
        <div ref={modalRef} className="relative mt-0">
          <Image
            src={url}
            alt="Contest Poster"
            width={468}
            height={624}
            className="h-[624px] w-[468px] rounded-2xl border-0 object-contain"
          />
          <AiFillCloseSquare
            onClick={CloseModal}
            className="absolute right-[15px] top-4 h-10 w-10"
          />
        </div>
      </BaseModal>
    </>
  )
}
