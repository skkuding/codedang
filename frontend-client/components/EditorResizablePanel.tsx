'use client'

import Codeeditor from '@/components/Codeeditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStorage } from '@/lib/hooks'
import useEditorStore from '@/stores/editor'
import type { Language, ProblemDetail } from '@/types/type'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useEffect } from 'react'
import Loading from '../app/problem/[problemId]/loading'
import EditorHeader from './EditorHeader'

interface ProblemEditorProps {
  problem: ProblemDetail
  children: React.ReactNode
}

export default function EditorMainResizablePanel({
  problem,
  children
}: ProblemEditorProps) {
  // get programming language from localStorage for default value
  const { value } = useStorage<Language>(
    'programming_lang',
    problem.languages[0]
  )
  const { code, setCode, setLanguage, language } = useEditorStore()
  const pathname = usePathname()

  useEffect(() => {
    if (!language) {
      setLanguage(value ?? problem.languages[0])
    } else if (language && !problem.languages.includes(language)) {
      // if value in storage is not in languages, set value to the first language
      setLanguage(problem.languages[0])
    }
  }, [problem.languages, value, setLanguage, language])

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
                pathname.startsWith(`/problem/${problem.id}/submission`)
                  ? 'Submission'
                  : 'Description'
              }
            >
              <TabsList className="bg-slate-900">
                <Link href={`/problem/${problem.id}` as Route}>
                  <TabsTrigger
                    value="Description"
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400"
                  >
                    Description
                  </TabsTrigger>
                </Link>
                <Link href={`/problem/${problem.id}/submission` as Route}>
                  <TabsTrigger
                    value="Submission"
                    className="data-[state=active]:bg-slate-700 data-[state=active]:text-blue-400"
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
          <EditorHeader problem={problem} />
          <Codeeditor
            value={code}
            language={language as Language}
            onChange={setCode}
            height="100%"
            className="h-full"
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
