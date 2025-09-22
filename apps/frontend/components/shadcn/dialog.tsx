'use client'

import { cn } from '@/libs/utils'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import * as React from 'react'

// Used to change the background color of the overlay
type DialogOverlayProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Overlay
> & {
  showDarkOverlay?: boolean // If showDarkOverlay is true, the overlay will have a different background color
}
// Used to change the background color of the overlay
interface ExtendedDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  showDarkOverlay?: boolean
  hideCloseButton?: boolean
}

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, showDarkOverlay = false, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 backdrop-blur-xs fixed inset-0 z-50 bg-gray-100/60 dark:bg-gray-950/60',
      className,
      {
        // Different Overlay background color
        'backdrop-blur-xs bg-slate-950/30': showDarkOverlay
      }
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ExtendedDialogContentProps
>(
  (
    { className, children, showDarkOverlay, hideCloseButton = false, ...props },
    ref
  ) => (
    <DialogPortal>
      <DialogOverlay showDarkOverlay={showDarkOverlay} />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          className,
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] grid-cols-1 gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 sm:rounded-lg dark:border-gray-800 dark:bg-gray-950',
          className
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close
            id="closeDialog"
            className="rounded-xs focus:outline-hidden absolute right-5 top-[30px] pr-[34px] opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
}
