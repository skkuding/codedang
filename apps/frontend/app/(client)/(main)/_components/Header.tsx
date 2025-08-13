import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { MobileMenu } from '@/components/auth/MobileMenu'
import { auth } from '@/libs/auth'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import Image from 'next/image'
import Link from 'next/link'
import { NavLink } from './NavLink'

export async function Header() {
  const session = await auth()
  return (
    <header className="backdrop-blur-xs fixed left-0 z-40 grid h-[60px] w-full place-items-center bg-white/80 px-[30px]">
      <div className="flex w-full max-w-[1440px] items-center justify-between gap-5 lg:px-[116px]">
        {/* FIXME: If you uncomment a group tab, you have to remove a pr-20 tailwind class */}
        <div className="flex min-w-fit items-center justify-between gap-8 text-[16px]">
          <MobileMenu session={session} />

          <Link href="/">
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
        </div>

        <HeaderAuthPanel session={session} />
      </div>
    </header>
  )
}
