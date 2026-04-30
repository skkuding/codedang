'use client'

import { Input, type InputProps } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { IoSearch } from 'react-icons/io5'

interface SearchInputProps extends InputProps {
  containerClassName?: string
}

export const SearchInput = ({
  className,
  containerClassName,
  sizeVariant = 'sm',
  ...props
}: SearchInputProps) => {
  return (
    <div
      className={cn('relative min-w-[184px] max-w-[580px]', containerClassName)}
    >
      <IoSearch
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
        color="#C4C4C4"
      />
      <Input
        sizeVariant={sizeVariant}
        className={cn(
          'text-body1_m_16 rounded-full px-8 placeholder:text-[#C4C4C4]',
          className
        )}
        {...props}
      />
    </div>
  )
}
