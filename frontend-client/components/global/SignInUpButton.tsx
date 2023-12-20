'use client'

import { RxHamburgerMenu } from 'react-icons/rx'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import Signin from './Signin'

const SignInUpButton = () => {
  return (
    <div className="ml-2 flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={'outline'}
            className="hidden border-none px-3 py-1 text-base font-semibold md:block"
          >
            Sign in
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <Signin />
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={'outline'}
            className="hidden px-3 py-1 text-base font-bold md:block"
          >
            Sign up
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <Signin />
        </DialogContent>
      </Dialog>
      <RxHamburgerMenu size="30" className="md:hidden" />
    </div>
  )
}

export default SignInUpButton
