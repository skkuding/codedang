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
  levels: string[]
}

export default function OptionSelect({ levels }: OptionSelectProps) {
  const [level, setLevel] = useState(levels[0])

  return (
    <Select onValueChange={setLevel} value={level}>
      <SelectTrigger className="w-[115px] font-bold hover:bg-gray-100 focus:outline-none focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {levels.map((level) => (
            <SelectItem key={level} value={level}>
              {level}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
