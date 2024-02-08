'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import useEditorStore from '@/stores/editor'

interface MainResizablePanelProps {
  languages: string[]
  // setLang: React.Dispatch<React.SetStateAction<string>>
}

export default function SelectScrollable({
  languages
  // setLang
}: MainResizablePanelProps) {
  const { language, setLanguage } = useEditorStore()
  return (
    <Select
      onValueChange={(language) => {
        setLanguage(language)
      }}
      value={language}
    >
      <SelectTrigger className="h-7 w-fit shrink-0 rounded-md border-none bg-slate-600 px-2 hover:bg-slate-700 focus:outline-none focus:ring-0 focus:ring-offset-0">
        <p className="pr-1">
          <SelectValue />
        </p>
      </SelectTrigger>
      <SelectContent className="border-slate-700 bg-slate-800">
        <SelectGroup className="text-white">
          {languages.map((language) => (
            <SelectItem
              key={language}
              value={language}
              className="cursor-pointer ring-0 hover:bg-slate-700"
            >
              {language}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
