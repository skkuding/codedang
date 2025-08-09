'use client'

import { AuthModal } from '@/components/auth/AuthModal'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { useAuthModalStore } from '@/stores/authModal'
import { useEffect } from 'react'

export default function LoginPage() {
  const { currentModal, hideModal, showSignIn } = useAuthModalStore(
    (state) => state
  )

  useEffect(() => {
    showSignIn()
  }, [showSignIn])

  return (
    <Dialog open={currentModal !== ''} onOpenChange={hideModal}>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault()
        }}
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
        }}
        hideCloseButton={true}
        className="min-h-120 max-w-82"
      >
        <AuthModal />
      </DialogContent>
    </Dialog>
  )
}
