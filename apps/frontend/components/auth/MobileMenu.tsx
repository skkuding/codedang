'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { useAuthModalStore } from '@/stores/authModal'
import type { Session } from 'next-auth'
import { RxHamburgerMenu } from 'react-icons/rx'
import { AccountItems, NavItems } from './HeaderAuthPanel'

export function MobileMenu({ session }: { session: Session | null }) {
  const { showSignIn, showSignUp } = useAuthModalStore((state) => state)

  return (
    <div className="lg:hidden">
      <DropdownMenu>
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
          <NavItems />
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
