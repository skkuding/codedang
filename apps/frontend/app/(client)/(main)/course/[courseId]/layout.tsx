import { Separator } from '@/components/shadcn/separator'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from './_components/Header'
import { Sidebar } from './_components/Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh w-full flex-col">
      <header>
        <Header />
      </header>
      <Separator />
      <div className="flex flex-row">
        <nav className="flex w-60 flex-col bg-white p-2 px-6 pb-6 pt-20 text-sm font-medium">
          <Link href="/" className="ml-6">
            <Image
              src={codedangLogo}
              alt="코드당"
              width={135.252}
              height={28}
            />
          </Link>
          <Separator className="my-4 transition" />
          <Sidebar />
        </nav>
        <Separator orientation="vertical" />
        <article>{children}</article>
      </div>
    </div>
  )
}
