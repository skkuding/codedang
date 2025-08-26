'use client'

import { AuthModal } from '@/components/auth/AuthModal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { useSession } from '@/libs/hooks/useSession'
import { useAuthModalStore } from '@/stores/authModal'
import type { Route } from 'next'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { currentModal, hideModal, showSignIn } = useAuthModalStore(
    (state) => state
  )
  const session = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    showSignIn()
  }, [showSignIn])

  useEffect(() => {
    if (session) {
      const redirectUrl = searchParams.get('redirectUrl')
      if (redirectUrl) {
        router.push(redirectUrl as Route)
      } else {
        router.push('/')
      }
    }
  }, [session, router, searchParams])

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
        className="!h-[620px] !w-[380px] rounded-[10px]"
      >
        <DialogHeader className="hidden">
          <DialogTitle />
        </DialogHeader>
        <AuthModal />
      </DialogContent>
    </Dialog>
  )
}
