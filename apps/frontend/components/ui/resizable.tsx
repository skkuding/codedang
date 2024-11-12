import { cn } from '@/libs/utils'
// import { GripVertical } from 'lucide-react';
import { MoveHorizontal } from 'lucide-react'
import * as ResizablePrimitive from 'react-resizable-panels'

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
      className
    )}
    {...props}
  />
)

const ResizablePanel = ResizablePrimitive.Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'relative flex w-px items-center justify-center bg-slate-500 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 dark:bg-gray-800 dark:focus-visible:ring-gray-300 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      className
    )}
    {...props}
  >
    {withHandle && (
      // Changed from GripVertical to MoveHorizontal
      // <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-slate-500 bg-slate-500 dark:border-gray-800 dark:bg-gray-800">
      //   <GripVertical className="h-2.5 w-2.5" />
      // </div>
      <div className="z-10 flex h-5 w-6 items-center justify-center rounded-sm border border-slate-600 bg-neutral-700 px-0.5 hover:bg-[#182C53] active:bg-[#244C92] dark:border-gray-800 dark:bg-gray-800">
        <MoveHorizontal className="h-5 w-4 text-slate-300 hover:text-blue-400 active:text-blue-400" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
