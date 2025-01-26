'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from '@/components/shadcn/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/shadcn/dropdown-menu'
import { cn, fetcherWithAuth } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import { LogOut, UserRoundCog, ChevronDown } from 'lucide-react'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BiSolidUser } from 'react-icons/bi'
import { RxHamburgerMenu } from 'react-icons/rx'
import { AuthModal } from './AuthModal'
import { UpdateInformation } from './UpdateInformation'

interface HeaderAuthPanelProps {
  session: Session | null
  group?: 'default' | 'editor'
}

export function HeaderAuthPanel({
  session,
  group = 'default'
}: HeaderAuthPanelProps) {
  const { currentModal, hideModal, showSignIn, showSignUp } = useAuthModalStore(
    (state) => state
  )
  const isUser = session?.user.role === 'User'
  const isEditor = group === 'editor'
  const [needsUpdate, setNeedsUpdate] = useState(false)
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    const checkIfNeedsUpdate = async () => {
      const userResponse = await fetcherWithAuth.get('user')
      const user: { role: string; studentId: string; major: string } =
        await userResponse.json()
      const updateNeeded =
        user.role === 'User' &&
        (user.studentId === '0000000000' || user.major === 'none')

      setNeedsUpdate(updateNeeded)
    }
    if (session) {
      checkIfNeedsUpdate()
    }
  }, [session, pathname])

  const shouldShowDialog =
    needsUpdate && pathname.split('/').pop() !== 'settings'

  return (
    <div className="ml-2 flex items-center gap-2">
      {session ? (
        <>
          <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
            <DropdownMenuTrigger
              className={cn(
                'hidden items-center gap-2 rounded-md px-4 py-1 md:flex',
                isEditor ? 'border-0 ring-offset-0' : 'bg-primary text-white'
              )}
            >
              <BiSolidUser
                className={cn(
                  'h-4 w-4',
                  isEditor ? 'size-6 rounded-none text-gray-300' : 'text-white'
                )}
              />
              {!isEditor && (
                <p className="font-semibold text-white">
                  {session?.user.username}
                </p>
              )}
              <ChevronDown
                className={cn('w-4 text-white', isDropdownOpen && 'rotate-180')}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={cn(
                isEditor &&
                  'mr-5 rounded-sm border-none bg-[#4C5565] px-0 font-normal text-white'
              )}
            >
              {!isUser && (
                <Link href="/admin">
                  <DropdownMenuItem
                    className={cn(
                      'flex cursor-pointer items-center gap-1',
                      isEditor
                        ? 'rounded-none text-white focus:bg-[#222939] focus:text-white'
                        : 'font-semibold'
                    )}
                  >
                    <UserRoundCog className="size-4" /> Management
                  </DropdownMenuItem>
                </Link>
              )}
              <Link href="/settings">
                <DropdownMenuItem
                  className={cn(
                    'flex cursor-pointer items-center gap-1',
                    isEditor
                      ? 'rounded-none text-white focus:bg-[#222939] focus:text-white'
                      : 'font-semibold'
                  )}
                >
                  <UserRoundCog className="size-4" /> Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className={cn(
                  'flex cursor-pointer items-center gap-1',
                  isEditor
                    ? 'rounded-none text-white focus:bg-[#222939] focus:text-white'
                    : 'font-semibold'
                )}
                onClick={() => {
                  signOut({ callbackUrl: '/', redirect: true })
                }}
              >
                <LogOut className="size-4" /> LogOut
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog open={shouldShowDialog}>
            <DialogContent
              className="min-h-[30rem] max-w-[20.5rem]"
              hideCloseButton={true}
            >
              <UpdateInformation />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Dialog open={currentModal !== ''} onOpenChange={hideModal}>
          <DialogTrigger asChild>
            <Button
              onClick={() => showSignIn()}
              variant={'outline'}
              className={cn(
                'mr-3 hidden rounded-lg px-4 py-1 text-sm font-semibold md:block',
                isEditor
                  ? 'h-8 rounded-[4px] border-none bg-[#EAF3FF] text-[11px]'
                  : ''
              )}
            >
              Log In
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                showSignUp()
              }}
              className={cn(
                'hidden rounded-lg px-4 py-1 text-sm md:block',
                isEditor
                  ? 'h-8 rounded-[4px] text-[11px] font-semibold'
                  : 'font-bold'
              )}
            >
              Sign Up
            </Button>
          </DialogTrigger>
          <DialogContent
            onOpenAutoFocus={(e) => {
              e.preventDefault()
            }}
            onInteractOutside={(e) => {
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
                signOut({ callbackUrl: '/', redirect: true })
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
            <Link href="/settings">
              <DropdownMenuItem
                className={cn(
                  'flex cursor-pointer items-center gap-1',
                  isEditor
                    ? 'rounded-none text-white focus:bg-[#222939] focus:text-white'
                    : 'font-semibold'
                )}
              >
                <UserRoundCog className="size-4" /> Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-1 font-semibold"
              onClick={() => {
                signOut({ callbackUrl: '/', redirect: true })
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
