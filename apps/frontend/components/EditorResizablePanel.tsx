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
  useLanguageStore,
  createCodeStore,
  TestResultsContext
} from '@/stores/editor'
import type { Language, ProblemDetail } from '@/types/type'
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
  const testResultStore = useContext(TestResultsContext)
  if (!testResultStore) throw new Error('TestResultsContext is not provided')
  const { testResults } = useStore(testResultStore)
  const testcases = problem.problemTestcase
  const testResultData =
    testResults.length > 0
      ? testcases.map((testcase, index) => ({
          id: testcase.id,
          input: testcase.input,
          expectedOutput: testcase.output,
          output: testResults[index]?.output,
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
                  <TestcasePanel testResult={testResultData} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

interface CodeEditorInEditorResizablePanelProps {
  enableCopyPaste: boolean
}

function CodeEditorInEditorResizablePanel({
  enableCopyPaste
}: CodeEditorInEditorResizablePanelProps) {
  const { language } = useLanguageStore()
  const { code, setCode } = createCodeStore()

  return (
    <CodeEditor
      value={code ?? ''}
      language={language as Language}
      onChange={setCode}
      enableCopyPaste={enableCopyPaste}
      height="100%"
      className="h-full"
    />
  )
}
