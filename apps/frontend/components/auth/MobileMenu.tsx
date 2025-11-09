'use client'

import { useHeaderTitle } from '@/app/(client)/(main)/_contexts/HeaderTitleContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/shadcn/sheet'
import arrowBottomIcon from '@/public/icons/arrow-bottom.svg'
import courseIcon from '@/public/icons/course-sidebar.svg'
import detailOnMobileIcon from '@/public/icons/detail-on-mobile.svg'
import noticeIcon from '@/public/icons/notice.svg'
import prizeIcon from '@/public/icons/prize.svg'
import problemIcon from '@/public/icons/problem-sidebar.svg'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import { useAuthModalStore } from '@/stores/authModal'
import type { Session } from 'next-auth'
import Image from 'next/image'
import Link from 'next/link'
import { FaAnglesLeft } from 'react-icons/fa6'
import { RxHamburgerMenu } from 'react-icons/rx'
import { AccountItems } from './AccountItems'

export function MobileMenu({ session }: { session: Session | null }) {
  const { headerTitle } = useHeaderTitle()
  const { showSignIn, showSignUp } = useAuthModalStore((state) => state)

  const navItems = [
    { href: '/notice', label: 'Notice', icon: noticeIcon },
    { href: '/problem', label: 'Problem', icon: problemIcon },
    { href: '/course', label: 'Course', icon: courseIcon },
    { href: '/contest', label: 'Contest', icon: prizeIcon }
  ]

  return (
    <div className="lg:hidden">
      {/* Mobile */}
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open navigation menu"
              className="flex h-6 w-6 items-center justify-center"
            >
              <Image
                src={detailOnMobileIcon}
                alt="Open menu"
                width={24}
                height={24}
              />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            aria-label="Mobile navigation menu"
            className="flex w-[260px] flex-col bg-white px-6 pb-6 pt-10"
          >
            <div className="border-b border-neutral-300 pb-6">
              <div className="flex h-6 items-center justify-end">
                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label="Close navigation"
                    className="flex items-center"
                  >
                    <FaAnglesLeft className="h-5 w-5 text-neutral-400" />
                  </button>
                </SheetClose>
              </div>

              <div className="mt-6 flex items-center">
                <Link href="/" className="flex items-center px-4">
                  <Image
                    src={codedangLogo}
                    alt="코드당"
                    width={146}
                    height={20}
                  />
                </Link>
              </div>
            </div>

            <nav className="mt-6 flex flex-1 flex-col space-y-3 text-[18px] font-normal leading-[25.2px] tracking-[-0.54px] text-neutral-700">
              {headerTitle && (
                <SheetClose asChild>
                  <Link
                    href="/"
                    className="flex items-center px-4 py-3 text-neutral-700"
                  >
                    Home
                  </Link>
                </SheetClose>
              )}

              {navItems.map((item) => {
                if (item.label === 'Course') {
                  return (
                    <div
                      key={item.href}
                      className="flex items-center justify-between rounded-full px-4 py-3 hover:bg-gray-100"
                    >
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className="flex items-center gap-[10px]"
                        >
                          <span className="flex h-[18px] w-[18px] items-center justify-center text-neutral-300">
                            <Image
                              src={item.icon}
                              alt={`${item.label} icon`}
                              width={18}
                              height={18}
                            />
                          </span>
                          <span className="text-neutral-700">{item.label}</span>
                        </Link>
                      </SheetClose>

                      <span className="flex h-3 w-3 items-center justify-center">
                        <Image
                          src={arrowBottomIcon}
                          alt="Course menu"
                          width={12}
                          height={12}
                        />
                      </span>
                    </div>
                  )
                }

                return (
                  <SheetClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-[10px] rounded-full px-4 py-3 hover:bg-gray-100"
                    >
                      <span className="flex h-[18px] w-[18px] items-center justify-center text-neutral-300">
                        <Image
                          src={item.icon}
                          alt={`${item.label} icon`}
                          width={18}
                          height={18}
                        />
                      </span>
                      <span className="text-neutral-700">{item.label}</span>
                    </Link>
                  </SheetClose>
                )
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* sm 이상: 기존 구조 유지 */}
      <div className="hidden sm:block">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="flex items-center">
            <RxHamburgerMenu size={30} />
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
