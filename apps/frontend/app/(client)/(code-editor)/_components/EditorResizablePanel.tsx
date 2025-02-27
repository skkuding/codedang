'use client'

import { CodeEditor } from '@/components/CodeEditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import bottomCenterIcon from '@/public/icons/bottom-center.svg'
import syncIcon from '@/public/icons/sync.svg'
import { useLanguageStore, useCodeStore } from '@/stores/editor'
import type { ProblemDetail } from '@/types/type'
import type { Route } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Loading from '../problem/[problemId]/loading'
import { EditorHeader } from './EditorHeader/EditorHeader'
import { LeaderboardModalDialog } from './LeaderboardModalDialog'
import { TestcasePanel } from './TestcasePanel/TestcasePanel'
import { useLeaderboardSync } from './context/ReFetchingLeaderboardStoreProvider'
import { TestPollingStoreProvider } from './context/TestPollingStoreProvider'
import { TestcaseStoreProvider } from './context/TestcaseStoreProvider'

interface ProblemEditorProps {
  problem: ProblemDetail
  children: React.ReactNode
  contestId?: number
  assignmentId?: number
  courseId?: number
  enableCopyPaste?: boolean
}

export function EditorMainResizablePanel({
  problem,
  contestId,
  assignmentId,
  courseId,
  enableCopyPaste = true,
  children
}: ProblemEditorProps) {
  const triggerRefresh = useLeaderboardSync((state) => state.triggerRefresh)
  const pathname = usePathname()
  let base: string
  if (contestId) {
    base = `/contest/${contestId}` as const
  } else if (assignmentId) {
    base = `/course/${courseId}/assignment/${assignmentId}` as const
  } else {
    base = '' as const
  }
  const { language, setLanguage } = useLanguageStore(
    problem.id,
    contestId,
    assignmentId,
    courseId
  )()
  const [tabValue, setTabValue] = useState('Description')

  useEffect(() => {
    if (pathname.startsWith(`${base}/problem/${problem.id}/submission`)) {
      setTabValue('Submission')
    } else if (
      pathname.startsWith(`${base}/problem/${problem.id}/leaderboard`)
    ) {
      setTabValue('Leaderboard')
    } else {
      setTabValue('Description')
    }
  }, [pathname])

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
            <Tabs value={tabValue} className="flex-grow">
              <TabsList className="rounded bg-slate-900">
                <Link replace href={`${base}/problem/${problem.id}` as Route}>
                  <TabsTrigger
                    value="Description"
                    className="data-[state=active]:text-primary-light rounded-tab-button data-[state=active]:bg-slate-700"
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
                    className="data-[state=active]:text-primary-light rounded-tab-button data-[state=active]:bg-slate-700"
                  >
                    Submissions
                  </TabsTrigger>
                </Link>
                {contestId && (
                  <Link
                    replace
                    href={
                      `/contest/${contestId}/problem/${problem.id}/leaderboard` as Route
                    }
                  >
                    <TabsTrigger
                      value="Leaderboard"
                      className="data-[state=active]:text-primary-light rounded-tab-button data-[state=active]:bg-slate-700"
                    >
                      Leaderboard
                    </TabsTrigger>
                  </Link>
                )}
              </TabsList>
            </Tabs>
            {tabValue === 'Leaderboard' ? (
              <div className="flex gap-x-4">
                <LeaderboardModalDialog />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Image
                        src={syncIcon}
                        alt="Sync"
                        className="cursor-pointer"
                        onClick={triggerRefresh}
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="mt-1 flex h-[29px] w-[145px] items-center justify-center"
                    >
                      <Image
                        src={bottomCenterIcon}
                        alt="Tooltip arrow"
                        className="absolute -top-[2px] left-1/2 -translate-x-1/2 transform"
                      />
                      <p className="text-xs">Leaderboard is frozen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ) : null}
          </div>
          <ScrollArea className="[&>div>div]:!block">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle className="border-[0.5px] border-slate-700" />

      <ResizablePanel defaultSize={65} className="bg-[#222939]">
        <div className="grid-rows-editor grid h-full">
          <TestcaseStoreProvider
            problemId={problem.id}
            contestId={contestId}
            assignmentId={assignmentId}
            courseId={courseId}
            problemTestcase={problem.problemTestcase}
          >
            <TestPollingStoreProvider>
              <EditorHeader
                problem={problem}
                contestId={contestId}
                assignmentId={assignmentId}
                courseId={courseId}
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
                      assignmentId={assignmentId}
                      enableCopyPaste={enableCopyPaste}
                    />
                    <ScrollBar orientation="horizontal" />
                    <ScrollBar orientation="vertical" />
                  </ScrollArea>
                </ResizablePanel>
                <ResizableHandle className="border-[0.5px] border-slate-700" />
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
  assignmentId?: number
  enableCopyPaste: boolean
}

function CodeEditorInEditorResizablePanel({
  problemId,
  contestId,
  assignmentId,
  enableCopyPaste
}: CodeEditorInEditorResizablePanelProps) {
  const { language } = useLanguageStore(problemId, contestId, assignmentId)()
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
