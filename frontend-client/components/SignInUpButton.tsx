'use client'

import { useState } from 'react'
import Modal from './Modal'
import Signin from './Signin'
import { Button } from './ui/button'

const SignInUpButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  return (
    <div className="ml-2 hidden items-center gap-2 md:flex">
      <Button
        onClick={open}
        variant={'outline'}
        className="border-none font-semibold"
      >
        Sign in
      </Button>
      <Modal isOpen={isOpen} close={close}>
        <Signin />
      </Modal>
      <Button onClick={open} variant={'outline'} className="font-bold">
        Sign up
      </Button>
      <Modal isOpen={isOpen} close={close}>
        <Signin />
      </Modal>
    </div>
  )
}

export default SignInUpButton
