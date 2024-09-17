'use client'

import CodeEditor from '@/components/CodeEditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CodeContext,
  TestResultsContext,
  createCodeStore,
  useLanguageStore
} from '@/stores/editor'
import type { Language, ProblemDetail, Template } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useContext, useEffect } from 'react'
import { useStore } from 'zustand'
import Loading from '../app/problem/[problemId]/loading'
import EditorHeader from './EditorHeader'
import TestcasePanel from './TestcasePanel'

interface ProblemEditorProps {
  problem: ProblemDetail
  children: React.ReactNode
  contestId?: number
  enableCopyPaste?: boolean
}

export default function EditorMainResizablePanel({
  problem,
  contestId,
  enableCopyPaste = true,
  children
}: ProblemEditorProps) {
  const pathname = usePathname()
  const base = contestId ? `/contest/${contestId}` : ''
  const { language, setLanguage } = useLanguageStore()
  const codeStore = createCodeStore(language, problem.id, contestId)
  const testResultStore = useContext(TestResultsContext)
  if (!testResultStore) throw new Error('TestResultsContext is not provided')
  const { testResults } = useStore(testResultStore)
  const testcases = problem.problemTestcase
  const testResultData =
    testResults.length > 0
      ? testcases.map((testcase, index) => ({
          ...testcase,
          result: testResults[index]?.result
        }))
      : null
  useEffect(() => {
    if (!problem.languages.includes(language)) {
      setLanguage(problem.languages[0])
    }
  }, [problem.languages, language, setLanguage])
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="border border-slate-700"
    >
      <ResizablePanel
        defaultSize={35}
        style={{ minWidth: '500px' }}
        minSize={20}
      >
        <div className="grid-rows-editor grid h-full grid-cols-1">
          <div className="flex h-full w-full items-center border-b border-slate-700 bg-[#222939] px-6">
            <Tabs
              value={
                pathname.startsWith(`${base}/problem/${problem.id}/submission`)
                  ? 'Submission'
                  : 'Description'
              }
            >
              <TabsList className="bg-slate-900">
                <Link href={`${base}/problem/${problem.id}` as Route}>
                  <TabsTrigger
                    value="Description"
                    className="data-[state=active]:text-primary-light data-[state=active]:bg-slate-700"
                  >
                    Description
                  </TabsTrigger>
                </Link>
                <Link
                  href={`${base}/problem/${problem.id}/submission` as Route}
                >
                  <TabsTrigger
                    value="Submission"
                    className="data-[state=active]:text-primary-light data-[state=active]:bg-slate-700"
                  >
                    Submissions
                  </TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>
          </div>
          <ScrollArea className="[&>div>div]:!block">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle className="border-[0.5px] border-slate-700" />

      <ResizablePanel defaultSize={65} className="bg-[#222939]">
        <div className="grid-rows-editor grid h-full">
          <CodeContext.Provider value={codeStore}>
            <EditorHeader
              problem={problem}
              contestId={contestId}
              templateString={problem.template[0]}
            />

            <ResizablePanelGroup direction="vertical" className="h-32">
              <ResizablePanel
                defaultSize={60}
                className="!overflow-x-auto !overflow-y-auto"
              >
                <ScrollArea className="h-full bg-[#121728]">
                  <CodeEditorInEditorResizablePanel
                    templateString={problem.template[0]}
                    enableCopyPaste={enableCopyPaste}
                  />
                  <ScrollBar orientation="horizontal" />
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              </ResizablePanel>
              {testResultData && (
                <>
                  <ResizableHandle
                    withHandle
                    className="border-[0.5px] border-slate-700"
                  />
                  <ResizablePanel defaultSize={40}>
                    <TestcasePanel data={testResultData} />
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </CodeContext.Provider>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

interface CodeEditorInEditorResizablePanelProps {
  templateString: string
  enableCopyPaste: boolean
}

function CodeEditorInEditorResizablePanel({
  templateString,
  enableCopyPaste
}: CodeEditorInEditorResizablePanelProps) {
  const { language } = useLanguageStore()
  const store = useContext(CodeContext)
  if (!store) throw new Error('CodeContext is not provided')
  const { code, setCode } = useStore(store)

  useEffect(() => {
    if (!templateString) return
    const parsedTemplates = JSON.parse(templateString)
    const filteredTemplate = parsedTemplates.filter(
      (template: Template) => template.language === language
    )
    if (!code) {
      if (filteredTemplate.length === 0) return
      setCode(filteredTemplate[0].code[0].text)
    }
  }, [language])

  return (
    <CodeEditor
      value={code}
      language={language as Language}
      onChange={setCode}
      enableCopyPaste={enableCopyPaste}
      height="100%"
      className="h-full"
    />
  )
}
