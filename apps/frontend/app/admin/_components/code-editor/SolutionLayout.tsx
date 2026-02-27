import { CodeEditor } from '@/components/CodeEditor'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import type { Language } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'

interface SolutionLayoutProps {
  solution: { code: string; language: Language }[]
  languages: string[]
}

export function SolutionLayout({ solution, languages }: SolutionLayoutProps) {
  const { t } = useTranslate()
  const [language, setLanguage] = useState<Language>(
    solution[0]?.language ?? 'C'
  )
  const [code, setCode] = useState('')

  useEffect(() => {
    const filtered = solution.find((item) => item.language === language)
    if (filtered) {
      setCode(filtered.code)
    }
  }, [language, solution])

  return (
    <div className="mx-6 my-8 flex flex-col gap-2">
      <div className="flex justify-between">
        <div className="text-lg font-bold">{t('solution_code')}</div>
        <Select
          value={language}
          onValueChange={(val: Language) => setLanguage(val)}
        >
          <SelectTrigger className="h-8 min-w-[86px] max-w-fit rounded-[4px] border-none bg-slate-600 px-2 font-mono hover:bg-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-[100px] max-w-fit border-none bg-[#4C5565] p-0 font-mono">
            <SelectGroup className="text-white">
              {languages.map((lang) => (
                <SelectItem
                  key={lang}
                  value={lang}
                  className="cursor-pointer hover:bg-[#222939]"
                >
                  {lang}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <CodeEditor
        value={code}
        language={language}
        readOnly
        enableCopyPaste={true}
        height="400px"
        className="rounded-lg"
      />
    </div>
  )
}
