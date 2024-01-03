'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'

export default function MainResizablePanel() {
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={35}></ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={65}></ResizablePanel>
    </ResizablePanelGroup>
  )
}
