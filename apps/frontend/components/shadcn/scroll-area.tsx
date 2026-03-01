'use client'

import { cn } from '@/libs/utils'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import * as React from 'react'

type ScrollAreaProps = React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> & {
  topFade?: boolean
  bottomFade?: boolean
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  (
    { className, children, topFade = false, bottomFade = false, ...props },
    ref
  ) => {
    const [atTop, setAtTop] = React.useState(true)
    const [atBottom, setAtBottom] = React.useState(false)
    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        type="always"
        className={cn('relative overflow-hidden', className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          className="h-full w-full rounded-[inherit] [&>div]:h-full"
          onScroll={(e) => {
            const el = e.currentTarget
            setAtTop(el.scrollTop === 0)
            setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight)
          }}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        {topFade && !atTop && (
          <div className="pointer-events-none absolute left-0 right-2.5 top-0 z-10 h-8 bg-gradient-to-b from-white via-white/80 to-transparent" />
        )}
        {bottomFade && !atBottom && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-2.5 z-10 h-8 bg-gradient-to-t from-white via-white/80 to-transparent" />
        )}
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    )
  }
)
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-px',
      orientation === 'horizontal' &&
        'h-2.5 flex-col border-t border-t-transparent p-px',
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-gray-200 dark:bg-gray-800" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
