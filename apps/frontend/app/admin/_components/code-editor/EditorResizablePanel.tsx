'use client'

import { CodeEditor } from '@/components/CodeEditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { GET_GROUP_MEMBER } from '@/graphql/user/queries'
import type { Language } from '@/types/type'
import { useSuspenseQuery } from '@apollo/client'
import { BiSolidUser } from 'react-icons/bi'

interface ProblemEditorProps {
  code: string
  language: string
  courseId: number
  userId: number
  children: React.ReactNode
}

export function EditorMainResizablePanel({
  code,
  language,
  courseId,
  userId,
  children
}: ProblemEditorProps) {
  const member = useSuspenseQuery(GET_GROUP_MEMBER, {
    variables: {
      groupId: courseId,
      userId
    }
  }).data?.getGroupMember

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="border border-slate-700"
    >
      <ResizablePanel
        defaultSize={35}
        style={{ minWidth: '500px' }}
        minSize={20}
      >
        <div className="grid-rows-editor grid h-full grid-cols-1">
          <div className="flex h-full w-full items-center gap-2 border-b border-slate-700 bg-[#222939] px-6">
            <BiSolidUser className="size-6 rounded-none text-gray-300" />
            <p className="text-[18px] font-medium">
              {member?.name}({member?.studentId})
            </p>
          </div>
          <ScrollArea className="[&>div>div]:!block">{children}</ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle className="border-[0.5px] border-slate-700" />

      <ResizablePanel defaultSize={65} className="bg-[#222939]">
        <div className="grid-rows-editor grid h-full">
          <div className="flex border-b border-b-slate-700 bg-[#222939]" />
          <ResizablePanelGroup direction="vertical" className="h-32">
            <ResizablePanel
              defaultSize={60}
              className="!overflow-x-auto !overflow-y-auto"
            >
              <ScrollArea className="h-full bg-[#121728]">
                <CodeEditor
                  value={code}
                  language={language as Language}
                  readOnly
                  enableCopyPaste={true}
                  height="100%"
                  className="h-full"
                />
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
