'use client'

import { Button } from '@/components/shadcn/button'
import { cn } from '@/libs/utils'
import { useState } from 'react'
import { MdClose, MdMenu } from 'react-icons/md'
import { GroupSideBar } from './_components/GroupSideBar'

export default function Layout({
  children,
  params
}: {
  children: React.ReactNode
  params: { groupId: string }
}) {
  const { groupId } = params
  const [isSideBarOpen, setIsSideBarOpen] = useState(true)
  return (
    <div className="flex h-dvh bg-neutral-50">
      {isSideBarOpen && (
        <nav className="relative flex w-40 flex-col bg-white p-2 px-4 pb-6 pt-20 text-sm font-medium">
          <Button
            className="absolute right-1 top-1"
            variant="slate"
            onClick={() => setIsSideBarOpen(false)}
          >
            <MdClose className="h-5 w-5" />
          </Button>
          <GroupSideBar groupId={groupId} />
        </nav>
      )}
      <div
        className={cn(
          '',
          isSideBarOpen && 'relative w-[calc(100%-10rem)] overflow-y-auto'
        )}
      >
        {!isSideBarOpen && (
          <Button variant="slate" onClick={() => setIsSideBarOpen(true)}>
            <MdMenu className="h-5 w-5" />
          </Button>
        )}
        {children}
      </div>
    </div>
  )
}
