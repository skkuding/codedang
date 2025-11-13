'use client'

import { cn } from '@/libs/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-40 bg-black/60', className)}
    {...props}
  />
))
SheetOverlay.displayName = 'SheetOverlay'

type SheetSide = 'left' | 'right'

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: SheetSide
  title?: string
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(
  (
    { className, side = 'right', children, title = 'Dialog', ...props },
    ref
  ) => {
    const sideClasses =
      side === 'left'
        ? 'inset-y-0 left-0 w-[260px] data-[state=open]:translate-x-0 data-[state=closed]:-translate-x-full'
        : 'inset-y-0 right-0 w-[260px] data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full'

    return (
      <SheetPortal>
        <SheetOverlay />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            'fixed z-50 bg-white shadow-lg transition-transform duration-300 ease-in-out',
            sideClasses,
            className
          )}
          {...props}
        >
          <DialogPrimitive.Title className="sr-only">
            {title}
          </DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </SheetPortal>
    )
  }
)
SheetContent.displayName = 'SheetContent'

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent
}
