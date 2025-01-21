'use client'

import { CodeEditor } from '@/components/CodeEditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import { useLanguageStore, useCodeStore } from '@/stores/editor'
import type { ProblemDetail } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import Loading from '../problem/[problemId]/loading'
import { EditorHeader } from './EditorHeader/EditorHeader'
import { TestcasePanel } from './TestcasePanel/TestcasePanel'
import { TestPollingStoreProvider } from './context/TestPollingStoreProvider'
import { TestcaseStoreProvider } from './context/TestcaseStoreProvider'

interface ProblemEditorProps {
  problem: ProblemDetail
  children: React.ReactNode
  contestId?: number
  enableCopyPaste?: boolean
}

export function EditorMainResizablePanel({
  problem,
  contestId,
  enableCopyPaste = true,
  children
}: ProblemEditorProps) {
  const pathname = usePathname()
  const base = contestId ? `/contest/${contestId}` : ''
  const { language, setLanguage } = useLanguageStore(problem.id, contestId)()

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
                <Link replace href={`${base}/problem/${problem.id}` as Route}>
                  <TabsTrigger
                    value="Description"
                    className="data-[state=active]:text-primary-light data-[state=active]:bg-slate-700"
                  >
                    Description
                  </TabsTrigger>
                </Link>
                <Link
                  replace
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
          <TestcaseStoreProvider
            problemId={problem.id}
            contestId={contestId}
            problemTestcase={problem.problemTestcase}
          >
            <TestPollingStoreProvider>
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
                      problemId={problem.id}
                      contestId={contestId}
                      enableCopyPaste={enableCopyPaste}
                    />
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </ResizablePanel>
                <ResizableHandle
                  withHandle
                  className="border-[0.5px] border-slate-700"
                />
                <ResizablePanel defaultSize={40}>
                  <TestcasePanel />
                </ResizablePanel>
              </ResizablePanelGroup>
            </TestPollingStoreProvider>
          </TestcaseStoreProvider>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

interface CodeEditorInEditorResizablePanelProps {
  problemId: number
  contestId?: number
  enableCopyPaste: boolean
}

function CodeEditorInEditorResizablePanel({
  problemId,
  contestId,
  enableCopyPaste
}: CodeEditorInEditorResizablePanelProps) {
  const { language } = useLanguageStore(problemId, contestId)()
  const { code, setCode } = useCodeStore()

  return (
    <CodeEditor
      value={code ?? ''}
      language={language}
      onChange={setCode}
      enableCopyPaste={enableCopyPaste}
      height="100%"
      className="h-full"
    />
  )
}
