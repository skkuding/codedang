import { cn } from '@/libs/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-3xl text-base font-medium ring-offset-white transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-color-neutral-95 disabled:text-color-neutral-70 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300',
  {
    variants: {
      variant: {
        default:
          'rounded-full bg-primary text-gray-50 hover:bg-primary-strong dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90',
        destructive:
          'bg-red-500 text-gray-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/90',
        outline:
          'rounded-full border  bg-white hover:bg-[#EBEBEB] dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-[#EBEBEB] dark:hover:text-gray-50 text-[#8A8A8A]',
        secondary:
          'rounded-full border border-primary bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-primary/20 dark:text-gray-50 dark:hover:bg-gray-800/80',
        ghost:
          'rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-50',
        link: 'text-gray-900 underline-offset-4 hover:underline dark:text-gray-50',
        slate: 'hover:text-primary-light',
        filter:
          'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9  px-3',
        lg: 'h-11  px-8',
        icon: 'h-[30px] w-[30px]'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
