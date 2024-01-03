import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { RxHamburgerMenu } from 'react-icons/rx'
import SignIn from './SignIn'
import SignUp from './SignUp'

export default async function HeaderAuthPanel() {
  const session = await getServerSession(authOptions)
  return (
    <div className="ml-2 flex items-center gap-2">
      {session ? (
        <p className="font-bold">{session.user.username}</p>
      ) : (
        <>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={'outline'}
                className="hidden border-none px-3 py-1 text-base font-semibold md:block"
              >
                Sign In
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[22rem]">
              <SignIn />
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant={'outline'}
                className="hidden px-3 py-1 text-base font-bold md:block"
              >
                Sign Up
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[22rem]">
              <SignUp />
            </DialogContent>
          </Dialog>
        </>
      )}
      <RxHamburgerMenu size="30" className="md:hidden" />
    </div>
  )
}
