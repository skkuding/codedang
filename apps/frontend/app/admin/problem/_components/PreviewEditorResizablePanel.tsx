'use client'

import { CodeEditor } from '@/components/CodeEditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import type { Language } from '@/types/type'

interface ProblemEditorProps {
  code: string
  language: string
  children: React.ReactNode
}

export function PreviewEditorResizablePanel({
  code,
  language,
  children
}: ProblemEditorProps) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="border border-slate-700"
    >
      <ResizablePanel
        defaultSize={35}
        style={{ minWidth: '500px' }}
        minSize={20}
        className="flex"
      >
        <div className="grid-rows-editor grid h-full w-full grid-cols-1">
          <div className="flex h-full w-full items-center border-b border-slate-700 bg-[#222939] px-6">
            <Tabs value={''} className="flex-grow">
              <TabsList className="rounded bg-slate-900">
                <TabsTrigger
                  value="Description"
                  className="text-primary-light rounded-tab-button bg-slate-700"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="Submission"
                  className="data-[state=active]:text-primary-light rounded-tab-button data-[state=active]:bg-slate-700"
                >
                  Submissions
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
