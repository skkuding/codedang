import { cva } from 'class-variance-authority'

export const formVariants = cva('w-full border bg-color-common-100', {
  variants: {
    size: {
      large: 'h-[56px] rounded-[12px] text-Bo',
      middle: 'h-[46px] rounded-[12px] ',
      small: 'h-[38px] rounded-[10px] '
    },
    status: {
      default: 'border-line',
      error: 'border-error',
      disabled: 'border-line bg-color-neutral-95'
    }
  },
  defaultVariants: {
    size: 'middle',
    status: 'default'
  }
})
