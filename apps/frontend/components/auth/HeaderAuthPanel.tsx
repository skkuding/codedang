'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import useAuthModalStore from '@/stores/authModal'
import useSignUpModalStore from '@/stores/signUpModal'
import { LogOut, User, UserRoundCog } from 'lucide-react'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { RxHamburgerMenu } from 'react-icons/rx'
import AuthModal from './AuthModal'

interface HeaderAuthPanelProps {
  session: Session | null
  group?: keyof typeof variants
}

const variants: { [key: string]: 'outline' | 'slate' } = {
  default: 'outline',
  editor: 'slate'
}

export default function HeaderAuthPanel({
  session,
  group = 'default'
}: HeaderAuthPanelProps) {
  const { currentModal, hideModal, showSignIn, showSignUp } = useAuthModalStore(
    (state) => state
  )
  const { setModalPage } = useSignUpModalStore((state) => state)
  return (
    <div className="ml-2 flex items-center gap-2">
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="hidden gap-2 px-4 py-1 md:flex">
            <p
              className={
                group === 'editor'
                  ? 'text-primary-light font-bold'
                  : 'text-primary font-bold'
              }
            >
              {session?.user.username}
            </p>
            <User className="text-gray-500" width={24} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {session?.user.role !== 'User' && (
              <Link href="/admin">
                <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
                  <UserRoundCog className="size-4" /> Management
                </DropdownMenuItem>
              </Link>
            )}
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-1 font-semibold"
              onClick={() => {
                signOut()
              }}
            >
              <LogOut className="size-4" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Dialog open={currentModal !== ''} onOpenChange={hideModal}>
          <DialogTrigger asChild>
            <Button
              onClick={() => showSignIn()}
              variant={variants[group]}
              className={cn(
                'hidden border-none px-3 py-1 text-base md:block',
                group === 'editor' ? 'font-medium' : 'font-semibold'
              )}
            >
              Log In
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                showSignUp()
                setModalPage(0)
              }}
              variant={variants[group]}
              className={cn(
                'hidden px-3 py-1 text-base md:block ',
                group === 'editor' ? 'font-medium' : 'font-bold'
              )}
            >
              Sign Up
            </Button>
          </DialogTrigger>
          <DialogContent
            onOpenAutoFocus={(e) => {
              e.preventDefault()
            }}
            className="min-h-[30rem] max-w-[20.5rem]"
          >
            <AuthModal />
          </DialogContent>
        </Dialog>
      )}
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex gap-2 px-4 py-1 md:hidden">
            <RxHamburgerMenu size="30" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-primary flex cursor-pointer items-center gap-1 font-semibold"
              onClick={() => {
                signOut()
              }}
            >
              {session?.user.username}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-300" />
            <Link href="/notice">
              <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
                Notice
              </DropdownMenuItem>
            </Link>
            <Link href="/contest">
              <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
                Contest
              </DropdownMenuItem>
            </Link>
            <Link href="/problem">
              <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
                Problem
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-gray-300" />
            {session?.user.role !== 'User' && (
              <Link href="/admin">
                <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
                  <UserRoundCog className="size-4" /> Management
                </DropdownMenuItem>
              </Link>
            )}
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-1 font-semibold"
              onClick={() => {
                signOut()
              }}
            >
              <LogOut className="size-4" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex gap-2 px-4 py-1 md:hidden">
            <RxHamburgerMenu size="30" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <Link href="/notice">
              <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
                Notice
              </DropdownMenuItem>
            </Link>
            <Link href="/contest">
              <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
                Contest
              </DropdownMenuItem>
            </Link>
            <Link href="/problem">
              <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
                Problem
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator className="bg-gray-300" />
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-1 font-semibold"
              onClick={() => showSignIn()}
            >
              Log In
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-1 font-semibold"
              onClick={() => {
                showSignUp()
                setModalPage(0)
              }}
            >
              Sign Up
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
