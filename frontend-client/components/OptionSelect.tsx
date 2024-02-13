import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useState } from 'react'

interface OptionSelectProps {
  options: string[]
  onChange: (option: string) => void
}

export default function OptionSelect({ options, onChange }: OptionSelectProps) {
  const [option, setOption] = useState(options[0])

  return (
    <Select
      onValueChange={setOption}
      value={option}
      onOpenChange={() => onChange(option)}
    >
      <SelectTrigger className="w-[115px] bg-white font-bold hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
        <SelectValue />
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
