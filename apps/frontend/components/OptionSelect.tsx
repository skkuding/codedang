import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface OptionSelectProps {
  options: string[] | readonly string[]
  onChange: (option: string) => void
  value?: string
  placeholder?: string
}

export default function OptionSelect({
  options,
  onChange,
  value,
  placeholder
}: OptionSelectProps) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value)}>
      <SelectTrigger className="w-[115px] bg-white font-bold hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
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
