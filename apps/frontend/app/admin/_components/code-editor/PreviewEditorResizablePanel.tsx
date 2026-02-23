'use client'

import { CodeEditor } from '@/components/CodeEditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import type { Language, Template } from '@/types/type'
import type { ProblemDetail } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import { EditorDescription } from './EditorDescription'
import { SolutionLayout } from './SolutionLayout'

interface ProblemEditorProps {
  problem: ProblemDetail
}

export function PreviewEditorResizablePanel({ problem }: ProblemEditorProps) {
  const [tabValue, setTabValue] = useState('Description')
  const hasSolution =
    Array.isArray(problem.solution) && problem.solution.length > 0
  const [language, setLanguage] = useState<Language>(problem.languages[0])
  const [code, setCode] = useState('')

  const { t } = useTranslate()

  useEffect(() => {
    const templates = problem.template ? JSON.parse(problem.template[0]) : []
    const filteredTemplate = templates.filter(
      (template: Template) => template.language === language
    )
    if (filteredTemplate.length === 0) {
      setCode('')
      return
    }
    setCode(filteredTemplate[0].code[0].text)
  }, [language, problem.template])

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="border border-slate-700"
    >
      <ResizablePanel
        defaultSize={35}
        style={{ minWidth: '500px' }}
        minSize={20}
        className="flex"
      >
        <div className="grid-rows-editor grid h-full w-full grid-cols-1">
          <div className="flex h-full w-full items-center border-b border-slate-700 bg-[#222939] px-6">
            <Tabs value={tabValue} className="grow">
              <TabsList className="rounded bg-slate-900">
                <TabsTrigger
                  value="Description"
                  className="data-[state=active]:text-primary-light rounded-tab-button w-[105px] data-[state=active]:bg-slate-700"
                  onClick={() => setTabValue('Description')}
                >
                  {t('description_tab')}
                </TabsTrigger>
                <TabsTrigger
                  value="Submission"
                  className="data-[state=active]:text-primary-light rounded-tab-button w-[105px] data-[state=active]:bg-slate-700"
                  onClick={() => setTabValue('Submission')}
                >
                  {t('submission_tab')}
                </TabsTrigger>
                {hasSolution && (
                  <TabsTrigger
                    value="Solution"
                    className="data-[state=active]:text-primary-light rounded-tab-button w-[105px] data-[state=active]:bg-slate-700"
                    onClick={() => setTabValue('Solution')}
                  >
                    {t('solution_tab')}
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
          <ScrollArea className="[&>div>div]:block!">
            {tabValue === 'Description' && (
              <EditorDescription problem={problem} />
            )}
            {tabValue === 'Solution' && hasSolution && (
              <SolutionLayout
                solution={problem.solution}
                languages={problem.languages}
              />
            )}
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle className="border-[0.5px] border-slate-700" />
      <ResizablePanel defaultSize={65} className="bg-[#222939]">
        <div className="grid-rows-editor grid h-full">
          <div className="flex shrink-0 items-center justify-end border-b border-b-slate-700 bg-[#222939] px-6">
            <Select
              onValueChange={(language: Language) => {
                setLanguage(language)
              }}
              value={language}
            >
              <SelectTrigger className="focus:outline-hidden h-8 min-w-[86px] max-w-fit shrink-0 rounded-[4px] border-none bg-slate-600 px-2 font-mono hover:bg-slate-700 focus:ring-0 focus:ring-offset-0">
                <p className="px-1">
                  <SelectValue />
                </p>
              </SelectTrigger>
              <SelectContent className="mt-3 min-w-[100px] max-w-fit border-none bg-[#4C5565] p-0 font-mono">
                <SelectGroup className="text-white">
                  {problem.languages.map((language) => (
                    <SelectItem
                      key={language}
                      value={language}
                      className="cursor-pointer hover:bg-[#222939]"
                    >
                      {language}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <ResizablePanelGroup direction="vertical" className="h-32">
            <ResizablePanel
              defaultSize={60}
              className="overflow-x-auto! overflow-y-auto!"
            >
              <ScrollArea className="h-full bg-[#121728]">
                <CodeEditor
                  value={code}
                  language={language}
                  readOnly
                  enableCopyPaste={true}
                  height="100%"
                  className="h-full"
                />
                <ScrollBar orientation="horizontal" />
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
