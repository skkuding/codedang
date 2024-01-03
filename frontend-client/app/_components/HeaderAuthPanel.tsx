'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import useAuthStore from '@/stores/auth'
import { RxHamburgerMenu } from 'react-icons/rx'
import Auth from './Auth'

export default function HeaderAuthPanel() {
  const { showSignIn, showSignUp } = useAuthStore((state) => state)
  return (
    <div className="ml-2 flex items-center gap-2">
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
            onClick={() => showSignUp()}
            variant={'outline'}
            className="hidden px-3 py-1 text-base font-bold md:block"
          >
            Sign Up
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[500px] max-w-[22rem]">
          <Auth />
        </DialogContent>
      </Dialog>
      <RxHamburgerMenu size="30" className="md:hidden" />
    </div>
  )
}
