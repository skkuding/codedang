'use client'

import CodeEditor from '@/components/CodeEditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeContext, createCodeStore, useLanguageStore } from '@/stores/editor'
import type { Language, ProblemDetail } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useContext, useEffect } from 'react'
import { useStore } from 'zustand'
import Loading from '../app/problem/[problemId]/loading'
import EditorHeader from './EditorHeader'

interface ProblemEditorProps {
  problem: ProblemDetail
  children: React.ReactNode
  contestId?: number
}

export default function EditorMainResizablePanel({
  problem,
  contestId,
  children
}: ProblemEditorProps) {
  const pathname = usePathname()
  const base = contestId ? `/contest/${contestId}` : ''
  const { language, setLanguage } = useLanguageStore()
  const store = createCodeStore(language, problem.id, contestId)
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
        style={{ minWidth: '400px' }}
        minSize={20}
      >
        <div className="grid-rows-editor grid h-full grid-cols-1">
          <div className="flex h-full w-full items-center border-b border-slate-700 bg-slate-800 px-6">
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
                    Submission
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

      <ResizableHandle withHandle className="border border-slate-700" />

      <ResizablePanel defaultSize={65} className="bg-slate-900">
        <div className="grid-rows-editor grid h-full">
          <CodeContext.Provider value={store}>
            <EditorHeader problem={problem} contestId={contestId} />
            <CodeEditorInEditorResizablePanel />
          </CodeContext.Provider>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

function CodeEditorInEditorResizablePanel() {
  const { language } = useLanguageStore()
  const store = useContext(CodeContext)
  if (!store) throw new Error('CodeContext is not provided')
  const { code, setCode } = useStore(store)
  return (
    <CodeEditor
      value={code}
      language={language as Language}
      onChange={setCode}
      height="100%"
      className="h-full"
    />
  )
}
