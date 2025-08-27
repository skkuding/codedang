'use client'

import { useHeaderTitle } from '@/app/(client)/(main)/_contexts/HeaderTitleContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { useAuthModalStore } from '@/stores/authModal'
import type { Session } from 'next-auth'
import Link from 'next/link'
import { RxHamburgerMenu } from 'react-icons/rx'
import { AccountItems } from './AccountItems'

export function MobileMenu({ session }: { session: Session | null }) {
  const { headerTitle } = useHeaderTitle()
  const { showSignIn, showSignUp } = useAuthModalStore((state) => state)

  return (
    <div className="lg:hidden">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="flex items-center">
          <RxHamburgerMenu size="30" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {session && (
            <>
              <DropdownMenuItem className="text-primary pointer-events-none flex select-none items-center gap-1 font-semibold">
                {session.user.username}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-300" />
            </>
          )}
          <NavItems headerTitle={headerTitle ?? ''} />
          <DropdownMenuSeparator className="bg-gray-300" />
          <AccountItems
            session={session}
            isAnyGroupLeader={false}
            isAnyContestAdmin={false}
            hasCreatePermission={false}
            isUser={session?.user.role === 'User'}
            isEditor={false}
            showSignIn={showSignIn}
            showSignUp={showSignUp}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function NavItems({ headerTitle }: { headerTitle?: string }) {
  const navItems = ['notice', 'contest', 'problem', 'course']

  return (
    <>
      {headerTitle && (
        <Link href="/">
          <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
            Home
          </DropdownMenuItem>
        </Link>
      )}
      {navItems.map((navItem) => (
        <Link href={`/${navItem}` as const} key={navItem}>
          <DropdownMenuItem className="flex cursor-pointer items-center gap-1 font-semibold">
            {navItem.charAt(0).toUpperCase() + navItem.slice(1)}
          </DropdownMenuItem>
        </Link>
      ))}
    </>
  )
}
