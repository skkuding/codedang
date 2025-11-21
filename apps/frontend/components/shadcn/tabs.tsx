'use client'

import { cn } from '@/libs/utils'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva('inline-flex', {
  variants: {
    variant: {
      default: 'mb-4 gap-1 rounded-full border-2 border-color-line p-1',
      outline: 'gap-0 rounded-full border-2 border-color-line p-1'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const tabsTriggerVariants = cva(
  'px-6 py-2.5 font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'rounded-full',
          'data-[state=active]:bg-primary data-[state=active]:text-white',
          'data-[state=inactive]:bg-transparent data-[state=inactive]:text-color-neutral-60'
        ],
        outline: [
          'rounded-full uppercase text-sm tracking-wide',
          'data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-primary',
          'data-[state=inactive]:bg-white data-[state=inactive]:text-color-neutral-60'
        ]
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-2', className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
