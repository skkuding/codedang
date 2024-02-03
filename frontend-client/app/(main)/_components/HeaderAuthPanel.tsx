'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import useAuthModalStore from '@/stores/authModal'
import useSignUpModalStore from '@/stores/signUpModal'
import type { Session } from 'next-auth'
import { RxHamburgerMenu } from 'react-icons/rx'
import AuthModal from './AuthModal'
import UserDropdownMenu from './UserDropdown'

interface HeaderAuthPanelProps {
  session: Session | null
}

export default function HeaderAuthPanel({ session }: HeaderAuthPanelProps) {
  const { showSignIn, showSignUp } = useAuthModalStore((state) => state)
  const { setModalPage } = useSignUpModalStore((state) => state)
  return (
    <div className="ml-2 flex items-center gap-2">
      {session ? (
        <UserDropdownMenu username={session.user.username} />
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
          <DialogContent className="min-h-[30rem] max-w-[20.5rem]">
            <AuthModal />
          </DialogContent>
        </Dialog>
      )}
      <RxHamburgerMenu size="30" className="md:hidden" />
    </div>
  )
}
