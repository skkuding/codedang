import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import * as React from 'react'

interface MainResizablePanelProps {
  languages: string[]
}

export default function SelectScrollable({
  languages
}: MainResizablePanelProps) {
  return (
    <Select>
      <SelectTrigger className="bg h-7 w-[82px] rounded-[5px] border-none bg-slate-500">
        <SelectValue placeholder="Cpp" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="text-white">
          {languages.map((language) => (
            <SelectItem key={language} value={language.toLowerCase()}>
              {language}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
