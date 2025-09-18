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

interface OptionSelectProps {
  options: string[] | readonly string[]
  onChange: (option: string) => void
  value?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  prefix?: string
  tabIndex?: number
}

export function OptionSelect({
  options,
  onChange,
  value,
  placeholder,
  className,
  disabled,
  prefix,
  tabIndex
}: OptionSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onChange(value)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          'focus:ring-primary w-full rounded-full bg-white p-4 text-sm font-semibold hover:bg-gray-50 focus:ring-offset-0',
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
            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="cursor-pointer hover:bg-gray-100/80"
              >
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </ScrollArea>
      </SelectContent>
    </Select>
  )
}
