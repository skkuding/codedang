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
}

export function OptionSelect({
  options,
  onChange,
  value,
  placeholder,
  className,
  disabled
}: OptionSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onChange(value)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(
          'focus:outline-hidden w-[115px] bg-white font-bold hover:bg-gray-50 focus:ring-0 focus:ring-offset-0',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-[115px] bg-white">
        <ScrollArea>
          <SelectGroup className="max-h-40">
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
