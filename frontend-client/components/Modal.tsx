'use client'

import { useState } from 'react'
import { RxCross2 } from 'react-icons/rx'

interface ModalProps {
  children: React.ReactNode
}

const Modal = ({ children }: ModalProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const close = () => {
    setIsOpen(false)
  }
  return (
    <>
      {isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center bg-black/20"
          onClick={close}
        >
          <div
            className="rounded-lg bg-white p-4"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <div className="flex justify-end">
              <button onClick={close}>
                <RxCross2 className="text-lg opacity-30 hover:opacity-80" />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  )
}

export default Modal
