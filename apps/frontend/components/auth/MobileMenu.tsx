'use client'

import { useHeaderTitle } from '@/app/(client)/(main)/_contexts/HeaderTitleContext'
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
import { useTranslate } from '@tolgee/react'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { BsPersonFillAdd } from 'react-icons/bs'
import { FaAnglesLeft } from 'react-icons/fa6'

export function MobileMenu({ session }: { session: Session | null }) {
  const { t } = useTranslate()
  const { headerTitle } = useHeaderTitle()
  const { showSignIn, showSignUp } = useAuthModalStore((state) => state)

  const navItems = [
    { href: '/notice', label: t('notice_capitalized'), icon: noticeIcon },
    { href: '/problem', label: t('problem_capitalized'), icon: problemIcon },
    { href: '/course', label: t('course_capitalized'), icon: courseIcon },
    { href: '/contest', label: t('contest_capitalized'), icon: prizeIcon }
  ]

  return (
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
        className="flex h-dvh w-[260px] flex-col bg-white px-6 pt-10"
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
              <Image src={codedangLogo} alt="코드당" width={146} height={20} />
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
                {t('home')}
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
        <div
          className="mb-10 mt-auto pt-6"
          style={{
            marginBottom: 'max(env(safe-area-inset-bottom, 0px), 40px)'
          }}
        >
          {session ? (
            <>
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
                    <span>{t('setting')}</span>
                  </span>
                </Link>
              </SheetClose>

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
                    <span>{t('log_out')}</span>
                  </span>
                </button>
              </SheetClose>
            </>
          ) : (
            <>
              <SheetClose asChild>
                <button
                  type="button"
                  className="w-full rounded-full px-4 py-3 text-left hover:bg-gray-100"
                  onClick={() => showSignUp()}
                >
                  <span className="flex items-center gap-[10px]">
                    <BsPersonFillAdd className="text-neutral-500" />
                    <span>{t('sign_up')}</span>
                  </span>
                </button>
              </SheetClose>
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
                    <span>{t('log_in')}</span>
                  </span>
                </button>
              </SheetClose>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
