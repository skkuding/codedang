import { Separator } from '@/components/shadcn/separator'
import codedangLogo from '@/public/logos/codedang-with-text.svg'
import Image from 'next/image'
import Link from 'next/link'
import { ClientApolloProvider } from './_components/ApolloProvider'
import { GroupAdminSideBar } from './_components/GroupAdminSideBar'
import { ManagementSidebar } from './_components/MangementSidebar'
import { SideBar } from './_components/SideBar'

// import { GroupSelect } from './_components/GroupSelect'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientApolloProvider>
      <div className="flex h-dvh bg-neutral-50">
        <nav className="bg-white p-2 pb-6 text-sm font-medium">
          {/* Todo: Group 기능 추가 시, Public Button 대신 GroupSelect 컴포넌트로 변경 */}
          {/* <GroupSelect /> */}
          {/* <Link href="/" className="ml-6">
            <Image
              src={codedangLogo}
              alt="코드당"
              width={135.252}
              height={28}
            />
          </Link>
          <Separator className="my-4 transition" /> */}
          {/* <GroupAdminSideBar /> */}
          {/* <SideBar /> */}
          {/*TODO: role이 groupAdmin인지 확인하고 아니면 그냥 SideBar를 보여주도록 할 예정 */}
          {/* <Link
            href={'/' as Route}
            className="mt-auto rounded px-4 py-2 text-slate-600 transition hover:bg-slate-100"
          >
            <FaArrowRightFromBracket className="mr-2 inline-block" />
            Quit
          </Link> */}
          <ManagementSidebar />
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
