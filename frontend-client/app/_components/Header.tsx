import CodedangLogo from '@/public/codedang.svg'
import Image from 'next/image'
import Link from 'next/link'
import HeaderAuthPanel from './HeaderAuthPanel'

export default function Header() {
  return (
    <header className="border-b-gray grid h-16 place-items-center border-b bg-white px-5">
      <div className="flex w-full max-w-7xl items-center justify-between gap-5">
        <div className="flex w-1/2 min-w-fit items-center justify-between gap-8">
          <Link href="/">
            <Image src={CodedangLogo} alt="코드당" width={90} />
          </Link>

          <nav className="hidden gap-8 capitalize md:flex">
            <Link href="/notice" className="text-lg hover:opacity-60">
              Notice
            </Link>
            <Link href="/contest" className="text-lg hover:opacity-60">
              Contest
            </Link>
            <Link href="/problem" className="text-lg hover:opacity-60">
              problem
            </Link>
            <Link href="/group" className="text-lg hover:opacity-60">
              Group
            </Link>
          </nav>
        </div>

        <HeaderAuthPanel />
      </div>
    </header>
  )
}
