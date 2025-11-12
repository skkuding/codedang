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
import courseIcon from '@/public/icons/course-sidebar.svg'
import detailOnMobileIcon from '@/public/icons/detail-on-mobile.svg'
import loginMobileIcon from '@/public/icons/login-mobile.svg'
import logoutMobileIcon from '@/public/icons/logout-mobile.svg'
import noticeIcon from '@/public/icons/notice.svg'
import prizeIcon from '@/public/icons/prize.svg'
import problemIcon from '@/public/icons/problem-sidebar.svg'
import settingsIcon from '@/public/icons/settings.svg'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import { useAuthModalStore } from '@/stores/authModal'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
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
            className="flex h-dvh w-[260px] flex-col bg-white px-6 pb-[env(safe-area-inset-bottom,40px)] pt-10"
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

              {navItems.map((item) => (
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
              ))}
            </nav>

            {/* 하단 고정 섹션 (border-top 제거, 스타일 통일) */}
            <div className="mt-auto pt-6">
              <SheetClose asChild>
                <Link
                  href="/settings"
                  className="block rounded-full px-4 py-3 text-[18px] hover:bg-gray-100"
                >
                  <span className="flex items-center gap-[10px]">
                    <Image
                      src={settingsIcon}
                      alt=""
                      width={15}
                      height={15}
                      aria-hidden
                    />
                    <span>Setting</span>
                  </span>
                </Link>
              </SheetClose>

              {session ? (
                <SheetClose asChild>
                  <button
                    type="button"
                    className="mt-2 w-full rounded-full px-4 py-3 text-left hover:bg-gray-100"
                    onClick={() => {
                      signOut({ callbackUrl: '/', redirect: true })
                    }}
                  >
                    <span className="flex items-center gap-[10px]">
                      <Image
                        src={logoutMobileIcon}
                        alt=""
                        width={20}
                        height={20}
                        aria-hidden
                      />
                      <span>Log Out</span>
                    </span>
                  </button>
                </SheetClose>
              ) : (
                <SheetClose asChild>
                  <button
                    type="button"
                    className="mt-2 w-full rounded-full px-3 py-3 text-left hover:bg-gray-100"
                    onClick={() => showSignIn()}
                  >
                    <span className="flex items-center gap-[10px]">
                      <Image
                        src={loginMobileIcon}
                        alt=""
                        width={20}
                        height={20}
                        aria-hidden
                      />
                      <span>Log In</span>
                    </span>
                  </button>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
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
