import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface OptionSelectProps {
  options: string[] | readonly string[]
  onChange: (option: string) => void
  value?: string
  placeholder?: string
  className?: string
}

export default function OptionSelect({
  options,
  onChange,
  value,
  placeholder,
  className
}: OptionSelectProps) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value)}>
      <SelectTrigger
        className={cn(
          'w-[115px] bg-white font-bold hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-[115px] bg-white">
        <SelectGroup>
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
      </SelectContent>
    </Select>
  )
}
