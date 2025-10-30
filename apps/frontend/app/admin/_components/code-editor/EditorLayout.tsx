import { HeaderAuthPanel } from '@/components/auth/HeaderAuthPanel'
import { Skeleton } from '@/components/shadcn/skeleton'
import { Suspense } from '@suspensive/react'
import type { Session } from 'next-auth'
import { AssignmentHeader } from './AssignmentHeader'
import {
  EditorMainResizablePanel,
  EditorMainResizablePanelFallback
} from './EditorResizablePanel'

interface EditorLayoutProps {
  session: Session | null
  children: React.ReactNode
}

export function EditorLayout({ session, children }: EditorLayoutProps) {
  return (
    <div className="grid-rows-editor fixed left-0 top-0 grid h-dvh w-full min-w-[1000px] overflow-x-auto bg-slate-800 text-white">
      <header className="flex h-12 justify-between bg-slate-900 px-6">
        <Suspense
          fallback={
            <Skeleton className="h-20 w-full rounded-lg bg-slate-900" />
          }
        >
          <AssignmentHeader />
          <HeaderAuthPanel session={session} group="editor" />
        </Suspense>
      </header>
      <Suspense fallback={<EditorMainResizablePanelFallback />}>
        <EditorMainResizablePanel>{children}</EditorMainResizablePanel>
      </Suspense>
    </div>
  )
}
