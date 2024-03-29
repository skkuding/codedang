import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Route } from 'next'
import Link from 'next/link'
import { FaArrowRightFromBracket } from 'react-icons/fa6'
import ClientApolloProvider from './_components/ApolloProvider'
import SideBar from './_components/SideBar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientApolloProvider>
      <div className="flex h-dvh bg-slate-100">
        <nav className="flex w-60 flex-col bg-white p-2 pt-8 text-sm font-medium">
          {/* Todo: Group 기능 추가 시, Public Button 대신 GroupSelect 컴포넌트로 변경 */}
          {/* <GroupSelect /> */}
          <Button
            variant="ghost"
            className="h-fit justify-between py-2 text-left text-lg font-bold text-slate-800"
          >
            Public
          </Button>
          <Separator className="my-4 transition" />
          <SideBar />
          <Link
            href={'/' as Route}
            className="mt-auto rounded px-4 py-2 text-slate-600 transition hover:bg-slate-100"
          >
            <FaArrowRightFromBracket className="mr-2 inline-block" />
            Quit
          </Link>
        </nav>
        <Separator orientation="vertical" />

        <div className="w-full overflow-y-auto">{children}</div>
      </div>
    </ClientApolloProvider>
  )
}
