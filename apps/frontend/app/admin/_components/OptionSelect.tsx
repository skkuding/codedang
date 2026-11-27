import { ScrollArea } from '@/components/shadcn/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { cn } from '@/libs/utils'
import type { ComponentProps } from 'react'

interface OptionSelectOption {
  label: string
  value: string
}

interface OptionSelectProps {
  options:
    | (string | OptionSelectOption)[]
    | readonly (string | OptionSelectOption)[]
  onChange: (option: string) => void
  value?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  prefix?: string
  tabIndex?: number
  triggerProps?: Pick<
    ComponentProps<typeof SelectTrigger>,
    'id' | 'aria-label' | 'aria-invalid' | 'aria-describedby'
  >
}

export function OptionSelect({
  options,
  onChange,
  value,
  placeholder,
  className,
  disabled,
  prefix,
  tabIndex,
  triggerProps
}: OptionSelectProps) {
  const normalizedOptions = options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option
  )

  return (
    <Select
      value={value}
      onValueChange={(value) => onChange(value)}
      disabled={disabled}
    >
      <SelectTrigger
        {...triggerProps}
        className={cn(
          'focus:ring-primary text-sub4_sb_14 w-full rounded-full bg-white p-4 hover:bg-gray-50 focus:ring-offset-0',
          className
        )}
        tabIndex={tabIndex}
      >
        <div className="flex items-center gap-[6px] truncate">
          {prefix && <span className={className}>{prefix}</span>}
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent className="w-[var(--radix-select-trigger-width)] rounded-xl bg-white">
        <ScrollArea>
          <SelectGroup className="flex flex-col gap-1 p-5">
            {normalizedOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="cursor-pointer hover:bg-gray-100/80"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </ScrollArea>
      </SelectContent>
    </Select>
  )
}
