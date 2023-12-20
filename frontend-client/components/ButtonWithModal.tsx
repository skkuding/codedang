'use client'

import { useState } from 'react'
import Modal from './Modal'
import { Button } from './ui/button'

interface ButtonWithModalProps {
  children: React.ReactNode
  buttonText: string
  buttonVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null
  className?: string
}

const ButtonWithModal = ({
  children,
  buttonText,
  buttonVariant,
  className
}: ButtonWithModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  return (
    <>
      <Button onClick={open} variant={buttonVariant} className={className}>
        {buttonText}
      </Button>
      <Modal isOpen={isOpen} close={close}>
        {children}
      </Modal>
    </>
  )
}

export default ButtonWithModal
