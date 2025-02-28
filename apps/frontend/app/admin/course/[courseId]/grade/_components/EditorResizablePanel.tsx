'use client'

import { CodeEditor } from '@/components/CodeEditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'

interface ProblemEditorProps {
  code: string
  children: React.ReactNode
}

export function EditorMainResizablePanel({
  code,
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
      >
        <div className="grid-rows-editor grid h-full grid-cols-1">
          <div className="flex h-full w-full items-center border-b border-slate-700 bg-[#222939] px-6">
            원래 Tab
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
                  language={'C'}
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
