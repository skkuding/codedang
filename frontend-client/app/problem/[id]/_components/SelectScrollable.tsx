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
  const [value, setValue] = useStorage('programming_lang', languages[0])
  // if value in storage is not in languages, set value to the first language
  if (value && !languages.includes(value)) setValue(languages[0])

  return (
    <Select
      onValueChange={(language) => {
        setValue(language)
      }}
      value={value}
    >
      <SelectTrigger className="bg h-7 w-[82px] rounded-[5px] border-none bg-slate-500 focus:outline-none focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="text-white">
          {languages.map((language) => (
            <SelectItem
              key={language}
              value={language}
              className="cursor-pointer ring-0 hover:bg-slate-600"
            >
              {language}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
