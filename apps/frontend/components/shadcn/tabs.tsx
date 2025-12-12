'use client'

import { cn } from '@/libs/utils'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva('inline-flex', {
  variants: {
    variant: {
      default: 'h-[46px] gap-1 rounded-full border-1 border-color-line p-1',
      outline: 'gap-0 rounded-full border-2 border-color-line p-1',
      editor: 'gap-1 rounded bg-editor-background-1 py-1 px-1.5' // 수정: 넓은 간격, 둥근 모서리, 어두운 배경, 패딩
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

const tabsTriggerVariants = cva(
  'font-normal transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'rounded-full w-[190px] text-base tracking-[-0.03em]',
          'data-[state=active]:bg-primary data-[state=active]:text-white',
          'data-[state=inactive]:bg-transparent data-[state=inactive]:text-color-neutral-60'
        ],
        outline: [
          'rounded-full uppercase text-sm tracking-wide',
          'data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-primary',
          'data-[state=inactive]:bg-white data-[state=inactive]:text-color-neutral-60'
        ],
        editor: [
          'rounded-sm text-xs font-normal px-2 py-1',
          'data-[state=active]:bg-[#334155] data-[state=active]:text-primary-light',
          'data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-100'
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
