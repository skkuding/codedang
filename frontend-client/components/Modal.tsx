'use client'

import { RxCross2 } from 'react-icons/rx'

interface ModalProps {
  children: React.ReactNode
  isOpen: boolean
  close: () => void
}

const Modal = ({ children, isOpen, close }: ModalProps) => {
  return (
    <>
      {isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 top-0 z-50 flex items-center justify-center bg-black/10 p-5 backdrop-blur-md"
          onClick={close}
        >
          <div
            className="relative rounded-lg bg-white p-7 pb-10"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <button onClick={close} className="absolute right-3 top-3">
              <RxCross2 className="text-lg opacity-30 hover:opacity-80" />
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  )
}

export default Modal
