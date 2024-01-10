'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useStorage } from '@/lib/hooks'

interface MainResizablePanelProps {
  languages: string[]
}

export default function SelectScrollable({
  languages
}: MainResizablePanelProps) {
  const [value, setValue] = useStorage('programming_lang', '')
  return (
    <Select
      onValueChange={(language) => {
        setValue(language)
      }}
    >
      <SelectTrigger className="bg h-7 w-[82px] rounded-[5px] border-none bg-slate-500">
        <SelectValue placeholder={value as string} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="text-white">
          {languages.map((language) => (
            <SelectItem key={language} value={language}>
              {language}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
