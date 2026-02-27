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
        {/* FIXME: If you uncomment a group tab, you have to remove a pr-20 tailwind class */}
        <div className="text-body3_r_16 flex w-full items-center justify-between">
          {/* Mobile */}
          <div className="lg:hidden">
            {headerTitle ? (
              <span className="text-sub3_sb_16 max-w-[200px] truncate">
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

          {/* Desktop */}
          <div className="hidden items-center lg:flex lg:gap-8">
            <Link href="/">
              <Image
                src={codedangLogo}
                alt="코드당"
                width={135.252}
                height={28}
                className="cursor-pointer"
              />
            </Link>
            <nav className="text-sub3_sb_16 flex gap-10 capitalize">
              <NavLink href="/notice" text="NOTICE" />
              <NavLink href="/contest" text="CONTEST" />
              <NavLink href="/problem" text="PROBLEM" />
              <NavLink href="/course" text="COURSE" />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <HeaderAuthPanel session={session} />
            <div className="lg:hidden">
              <MobileMenu session={session} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
