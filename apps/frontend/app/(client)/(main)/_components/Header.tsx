'use client'

import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { MobileMenu } from '@/components/auth/MobileMenu'
import { useSession } from '@/libs/hooks/useSession'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import Image from 'next/image'
import Link from 'next/link'
import { useHeaderTitle } from '../_contexts/HeaderTitleContext'
import { NavLink } from './NavLink'

export function Header() {
  const session = useSession()
  const { headerTitle } = useHeaderTitle()
  return (
    <header className="backdrop-blur-xs fixed left-0 z-40 grid h-[60px] w-full place-items-center bg-white px-5 lg:bg-white/80 lg:px-[30px]">
      <div className="flex w-full max-w-[1440px] items-center justify-between gap-5 lg:px-[116px]">
        {/* Mobile */}
        <div className="flex w-full items-center justify-between sm:hidden">
          <div>
            {headerTitle ? (
              <span className="max-w-[200px] truncate font-semibold">
                {headerTitle}
              </span>
            ) : (
              <Link href="/">
                <Image
                  src={codedangLogo}
                  alt="코드당"
                  width={135.252}
                  height={28}
                  className="cursor-pointer"
                />
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <HeaderAuthPanel session={session} />
            <MobileMenu session={session} />
          </div>
        </div>

        {/* FIXME: If you uncomment a group tab, you have to remove a pr-20 tailwind class */}
        {/* sm 이상: 기존 구조 유지 */}
        <div className="hidden w-full items-center justify-between gap-8 text-base sm:flex lg:w-fit">
          <MobileMenu session={session} />

          <div className="lg:hidden">
            {headerTitle ? (
              <span className="max-w-[200px] truncate font-semibold">
                {headerTitle}
              </span>
            ) : (
              <Link href="/">
                <Image
                  src={codedangLogo}
                  alt="코드당"
                  width={135.252}
                  height={28}
                  className="cursor-pointer"
                />
              </Link>
            )}
          </div>
          <Link className="hidden lg:block" href="/">
            <Image
              src={codedangLogo}
              alt="코드당"
              width={135.252}
              height={28}
              className="cursor-pointer"
            />
          </Link>
          <nav className="hidden font-semibold capitalize lg:flex lg:gap-10">
            <NavLink href="/notice" text="NOTICE" />
            <NavLink href="/contest" text="CONTEST" />
            <NavLink href="/problem" text="PROBLEM" />
            <NavLink href="/course" text="COURSE" />
            {/* TODO: Uncomment a group tab when we start to implement a group feature*/}
            {/* <NavLink href="/group" text="Group" /> */}
          </nav>
          <div className="lg:hidden">
            <HeaderAuthPanel session={session} />
          </div>
        </div>

        <div className="hidden lg:flex">
          <HeaderAuthPanel session={session} />
        </div>
      </div>
    </header>
  )
}
