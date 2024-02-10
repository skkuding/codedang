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
  onChange: (level: string) => void
}

export default function OptionSelect({ levels, onChange }: OptionSelectProps) {
  const [level, setLevel] = useState(levels[0])

  return (
    <Select
      onValueChange={setLevel}
      value={level}
      onOpenChange={() => onChange(level)}
    >
      <SelectTrigger className="w-[115px] bg-white font-bold hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="w-[115px] bg-white">
        <SelectGroup>
          {levels.map((level) => (
            <SelectItem
              key={level}
              value={level}
              className="cursor-pointer hover:bg-gray-100/80"
            >
              {level}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
