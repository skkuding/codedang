import { Separator } from '@/components/shadcn/separator'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import Image from 'next/image'
import Link from 'next/link'
import { ClientApolloProvider } from './_components/ApolloProvider'
import { SideBar } from './_components/SideBar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientApolloProvider>
      <div className="flex h-dvh bg-neutral-50">
        <nav className="flex w-60 flex-col bg-white p-2 px-6 pb-6 pt-20 text-sm font-medium">
          {/* Todo: Group 기능 추가 시, Public Button 대신 GroupSelect 컴포넌트로 변경 */}
          {/* <GroupSelect /> */}
          <Link href="/" className="ml-6">
            <Image
              src={codedangLogo}
              alt="코드당"
              width={135.252}
              height={28}
            />
          </Link>

          <Separator className="my-4 transition" />
          <SideBar />
          {/* <Link
            href={'/' as Route}
            className="mt-auto rounded px-4 py-2 text-slate-600 transition hover:bg-slate-100"
          >
            <FaArrowRightFromBracket className="mr-2 inline-block" />
            Quit
          </Link> */}
        </nav>
        <Separator orientation="vertical" />
        {/*NOTE: full width - sidebar width */}
        <div className="relative w-[calc(100%-15rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </ClientApolloProvider>
  )
}
