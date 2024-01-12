'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import useAuthModalStore from '@/stores/authModal'
import useSignUpModalStore from '@/stores/signUpModal'
import type { UserData } from '@/types/next-auth'
import { signOut } from 'next-auth/react'
import { RxHamburgerMenu } from 'react-icons/rx'
import AuthModal from './AuthModal'

interface HeaderAuthPanelProps {
  isAuth: boolean
  user: UserData | null
}

export default function HeaderAuthPanel({
  isAuth,
  user
}: HeaderAuthPanelProps) {
  const { showSignIn, showSignUp } = useAuthModalStore((state) => state)
  const { setModalPage } = useSignUpModalStore((state) => state)
  return (
    <div className="ml-2 flex items-center gap-2">
      {isAuth ? (
        <p
          className="font-bold"
          onClick={() => {
            signOut()
          }}
        >
          {user?.username}
        </p>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              onClick={() => showSignIn()}
              variant={'outline'}
              className="hidden border-none px-3 py-1 text-base font-semibold md:block"
            >
              Sign In
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                showSignUp()
                setModalPage(0)
              }}
              variant={'outline'}
              className="hidden px-3 py-1 text-base font-bold md:block"
            >
              Sign Up
            </Button>
          </DialogTrigger>
          <DialogContent className="h-[520px] max-w-[22rem]">
            <AuthModal />
          </DialogContent>
        </Dialog>
      )}
      <RxHamburgerMenu size="30" className="md:hidden" />
    </div>
  )
}
