import CodedangLogo from '@/public/codedang.svg'
import { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import HeaderAuthPanel from './HeaderAuthPanel'
import NavLink from './NavLink'

export default function Header() {
  return (
    <header className="border-b-gray grid h-16 w-full place-items-center border-b bg-white px-5">
      <div className="flex w-full max-w-7xl items-center justify-between gap-5">
        <div className="flex w-1/2 min-w-fit items-center justify-between gap-8">
          <Link href={'/' as Route}>
            <Image src={CodedangLogo} alt="코드당" width={90} />
          </Link>

          <nav className="hidden gap-8 capitalize md:flex">
            <NavLink href="/notice" text="Notice" />
            <NavLink href="/contest" text="Contest" />
            <NavLink href="/problem" text="Problem" />
            <NavLink href="/group" text="Group" />
          </nav>
        </div>

        <HeaderAuthPanel />
      </div>
    </header>
  )
}
