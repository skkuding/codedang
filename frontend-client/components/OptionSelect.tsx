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
}

export default function OptionSelect({ options }: OptionSelectProps) {
  const [option, setLevel] = useState(options[0])

  return (
    <Select onValueChange={setLevel} value={option}>
      <SelectTrigger className="w-[115px] font-bold hover:bg-gray-100 focus:outline-none focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
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
