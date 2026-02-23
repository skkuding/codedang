'use client'

import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { MobileMenu } from '@/components/auth/MobileMenu'
import { useSession } from '@/libs/hooks/useSession'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import Link from 'next/link'
import { useHeaderTitle } from '../_contexts/HeaderTitleContext'
import { NavLink } from './NavLink'

export function Header() {
  const session = useSession()
  const { headerTitle } = useHeaderTitle()
  const { t } = useTranslate()
  return (
    <header className="backdrop-blur-xs fixed left-0 z-40 grid h-[60px] w-full place-items-center bg-white px-5 lg:bg-white/80 lg:px-[30px]">
      <div className="flex w-full max-w-[1440px] items-center justify-between gap-5 lg:px-[116px]">
        {/* FIXME: If you uncomment a group tab, you have to remove a pr-20 tailwind class */}
        <div className="flex w-full min-w-fit items-center justify-between gap-8 text-[16px] lg:w-fit">
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
                  alt={t('codedang_logo_alt')}
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
              alt={t('codedang_logo_alt')}
              width={135.252}
              height={28}
              className="cursor-pointer"
            />
          </Link>
          <nav className="hidden font-semibold capitalize lg:flex lg:gap-10">
            <NavLink href="/notice" text={t('nav_notice')} />
            <NavLink href="/contest" text={t('nav_contest')} />
            <NavLink href="/problem" text={t('nav_problem')} />
            <NavLink href="/course" text={t('nav_course')} />
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
