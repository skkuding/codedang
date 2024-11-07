import HeaderAuthPanel from '@/components/auth/HeaderAuthPanel'
import { auth } from '@/lib/auth'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import Image from 'next/image'
import Link from 'next/link'
import NavLink from './NavLink'

export default async function Header() {
  const session = await auth()
  return (
    <header className="fixed left-0 z-40 grid h-14 w-full place-items-center bg-white/80">
      <div className="flex w-full max-w-7xl items-center justify-between gap-5 px-5">
        {/* FIXME: If you uncomment a group tab, you have to remove a pr-20 tailwind class */}
        <div className="flex min-w-fit items-center justify-between gap-8 text-[16px]">
          <Link href="/">
            <Image
              src={codedangLogo}
              alt="코드당"
              width={135.252}
              height={28}
            />
          </Link>

          <nav className="hidden gap-10 font-mono font-medium capitalize md:flex">
            <NavLink href="/notice" text="NOTICE" />
            <NavLink href="/contest" text="CONTEST" />
            <NavLink href="/problem" text="PROBLEM" />
            {/* TODO: Uncomment a group tab when we start to implement a group feature*/}
            {/* <NavLink href="/group" text="Group" /> */}
          </nav>
        </div>

        <HeaderAuthPanel session={session} />
      </div>
    </header>
  )
}
