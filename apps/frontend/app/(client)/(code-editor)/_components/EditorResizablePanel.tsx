'use client'

import { useQnaCommentsSync } from '@/app/(client)/(code-editor)/_components/context/RefetchingQnaCommentsStoreProvider'
import { CodeEditor } from '@/components/CodeEditor'
import { Button } from '@/components/shadcn/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea } from '@/components/shadcn/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/shadcn/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/shadcn/tooltip'
import { fetcherWithAuth } from '@/libs/utils'
import { cn } from '@/libs/utils'
import bottomCenterIcon from '@/public/icons/bottom-center.svg'
import syncIcon from '@/public/icons/sync.svg'
import { useLanguageStore, useCodeStore } from '@/stores/editor'
import { useSidePanelTabStore } from '@/stores/editorTabs'
import type { ProblemDetail, Contest } from '@/types/type'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import Loading from '../problem/[problemId]/loading'
import { EditorHeader } from './EditorHeader/EditorHeader'
import { LeaderboardModalDialog } from './LeaderboardModalDialog'
import { TestcasePanel } from './TestcasePanel/TestcasePanel'
import { useLeaderboardSync } from './context/ReFetchingLeaderboardStoreProvider'
import { useSubmissionDetailSync } from './context/ReFetchingSubmissionDetailStoreProvider'
import { useSubmissionSync } from './context/ReFetchingSubmissionStoreProvider'
import { TestPollingStoreProvider } from './context/TestPollingStoreProvider'
import { TestcaseStoreProvider } from './context/TestcaseStoreProvider'

interface ProblemEditorProps {
  problem: ProblemDetail
  children: React.ReactNode
  contestId?: number
  assignmentId?: number
  exerciseId?: number
  courseId?: number
  enableCopyPaste?: boolean
}

export function EditorMainResizablePanel({
  problem,
  contestId,
  assignmentId,
  exerciseId,
  courseId,
  enableCopyPaste = true,
  children
}: ProblemEditorProps) {
  const fetchFreezeTime = async (contestId: number | undefined) => {
    const res: Contest = await fetcherWithAuth
      .get(`contest/${contestId}`)
      .json()
    const freezeTime = res.freezeTime

    return freezeTime
  }

  const freezeQueryKey = contestId
    ? ['leaderboard freeze date', contestId]
    : ['leaderboard freeze date', 'no-contest']

  const { data: freezeTime } = useQuery({
    queryKey: freezeQueryKey,
    queryFn: () => {
      if (!contestId) {
        return Promise.resolve(null)
      }
      return fetchFreezeTime(contestId)
    }
  })
  const [isFrozen, setIsFrozen] = useState<boolean>(true)
  useEffect(() => {
    if (!contestId) {
      return
    }
    const now = new Date()
    const freezeTimeDate = freezeTime ? new Date(freezeTime) : new Date(0)
    setIsFrozen(now > freezeTimeDate)
  }, [freezeTime, contestId])

  const [isBottomPanelHidden, setIsBottomPanelHidden] = useState(false)
  const toggleBottomPanelVisibility = () => {
    setIsBottomPanelHidden((prev) => !prev)
  }
  const triggerRefresh = useLeaderboardSync((state) => state.triggerRefresh)
  const triggerSubmissionRefresh = useSubmissionSync(
    (state) => state.triggerRefresh
  )
  const triggerSubmissionDetailRefresh = useSubmissionDetailSync(
    (state) => state.triggerRefresh
  )
  const triggerQnaRefresh = useQnaCommentsSync((state) => state.triggerRefresh)
  const {
    isSidePanelHidden,
    toggleSidePanelVisibility
  }: { isSidePanelHidden: boolean; toggleSidePanelVisibility: () => void } =
    useSidePanelTabStore()

  const pathname = usePathname()
  const searchParams = useSearchParams()
  let base: string
  if (contestId) {
    base = `/contest/${contestId}` as const
  } else if (assignmentId) {
    base = `/course/${courseId}/assignment/${assignmentId}` as const
  } else if (exerciseId) {
    base = `/course/${courseId}/exercise/${exerciseId}` as const
  } else {
    base = '' as const
  }
  const { language, setLanguage } = useLanguageStore(
    problem.id,
    contestId,
    courseId,
    assignmentId,
    exerciseId
  )()
  const [tabValue, setTabValue] = useState('Description')

  useEffect(() => {
    if (pathname.startsWith(`${base}/problem/${problem.id}/submission`)) {
      setTabValue('Submission')
    } else if (
      pathname.startsWith(`${base}/problem/${problem.id}/leaderboard`)
    ) {
      setTabValue('Leaderboard')
    } else if (pathname.startsWith(`${base}/problem/${problem.id}/solution`)) {
      setTabValue('Solution')
    } else if (pathname.startsWith(`${base}/problem/${problem.id}/qna`)) {
      setTabValue('Qna')
    } else {
      setTabValue('Description')
    }
  }, [pathname, base, problem.id])

  useEffect(() => {
    if (!problem.languages.includes(language)) {
      setLanguage(problem.languages[0])
    }
  }, [problem.languages, language, setLanguage])

  const [isSubmissionDetail, setIsSubmissionDetail] = useState(false)
  useEffect(() => {
    const cellProblemId = searchParams.get('cellProblemId')
    if (cellProblemId) {
      setIsSubmissionDetail(true)
    } else {
      setIsSubmissionDetail(false)
    }
  }, [pathname, searchParams])

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="border border-slate-700"
    >
      <ResizablePanel
        defaultSize={35}
        style={{ minWidth: '500px' }}
        className={cn(isSidePanelHidden && 'hidden')}
        minSize={20}
      >
        <div className="grid-rows-editor grid h-full grid-cols-1">
          <div className="bg-editor-background-2 flex h-full w-full items-center border-b border-slate-700 px-6">
            <Tabs value={tabValue}>
              <TabsList variant="editor">
                <Link replace href={`${base}/problem/${problem.id}` as const}>
                  <TabsTrigger value="Description" variant="editor">
                    Description
                  </TabsTrigger>
                </Link>
                <Link
                  replace
                  href={`${base}/problem/${problem.id}/submission` as const}
                >
                  <TabsTrigger value="Submission" variant="editor">
                    Submissions
                  </TabsTrigger>
                </Link>
                {(assignmentId || exerciseId) &&
                  problem.solution &&
                  problem.solution.length > 0 && (
                    <Link
                      replace
                      href={`${base}/problem/${problem.id}/solution` as const}
                    >
                      <TabsTrigger value="Solution" variant="editor">
                        Solution
                      </TabsTrigger>
                    </Link>
                  )}
                {contestId && (
                  <Link
                    replace
                    href={
                      `/contest/${contestId}/problem/${problem.id}/leaderboard` as const
                    }
                  >
                    <TabsTrigger value="Leaderboard" variant="editor">
                      Leaderboard
                    </TabsTrigger>
                  </Link>
                )}
                {contestId && (
                  <Link
                    replace
                    href={
                      `/contest/${contestId}/problem/${problem.id}/qna` as const
                    }
                  >
                    <TabsTrigger value="Qna" variant="editor">
                      Q&A
                    </TabsTrigger>
                  </Link>
                )}
              </TabsList>
            </Tabs>
            {tabValue === 'Leaderboard' && (
              <div className="flex w-full items-center">
                <div className="ml-auto flex items-center gap-x-4">
                  <LeaderboardModalDialog />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Image
                          src={syncIcon}
                          alt="Sync"
                          className={`${isFrozen ? '' : 'cursor-pointer'} ml-auto`}
                          onClick={() => {
                            if (!isFrozen) {
                              triggerRefresh()
                            }
                          }}
                        />
                      </TooltipTrigger>
                      {isFrozen && (
                        <TooltipContent
                          side="bottom"
                          className="mt-1 flex h-[29px] w-[145px] items-center justify-center"
                        >
                          <Image
                            src={bottomCenterIcon}
                            alt="Tooltip arrow"
                            className="absolute -top-[2px] left-1/2 -translate-x-1/2 transform"
                          />
                          <p className="text-caption4_r_12">
                            Leaderboard is frozen
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
            {tabValue === 'Submission' && contestId && (
              <div className="flex w-full gap-x-4">
                <Image
                  src={syncIcon}
                  alt="Sync"
                  className={'ml-auto cursor-pointer'}
                  onClick={() => {
                    isSubmissionDetail
                      ? triggerSubmissionDetailRefresh()
                      : triggerSubmissionRefresh()
                  }}
                />
              </div>
            )}
            {tabValue === 'Qna' && contestId && (
              <div className="ml-auto flex gap-x-4">
                <Image
                  src={syncIcon}
                  alt="Sync"
                  className={'ml-4 cursor-pointer'}
                  onClick={() => {
                    triggerQnaRefresh()
                  }}
                />
              </div>
            )}
          </div>
          <ScrollArea className="[&>div>div]:block!">
            <Suspense fallback={<Loading />}>{children}</Suspense>
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizableHandle
        className={cn(
          'border-[0.5px] border-slate-700',
          isSidePanelHidden && 'hidden'
        )}
      />
      <ResizablePanel defaultSize={65} className="relative">
        <HidePanelButton
          isPanelHidden={isSidePanelHidden}
          toggleIsPanelHidden={toggleSidePanelVisibility}
          direction="horizontal"
        />
        <div className="grid-rows-editor grid h-full">
          <TestcaseStoreProvider
            problemId={problem.id}
            contestId={contestId}
            assignmentId={assignmentId}
            exerciseId={exerciseId}
            courseId={courseId}
            problemTestcase={problem.problemTestcase}
          >
            <TestPollingStoreProvider>
              <EditorHeader
                problem={problem}
                contestId={contestId}
                assignmentId={assignmentId}
                exerciseId={exerciseId}
                courseId={courseId}
                templateString={problem.template[0]}
              />
              <ResizablePanelGroup direction="vertical" className="h-32">
                <ResizablePanel
                  defaultSize={60}
                  className="overflow-x-auto! relative overflow-y-auto"
                >
                  <HidePanelButton
                    isPanelHidden={isBottomPanelHidden}
                    toggleIsPanelHidden={toggleBottomPanelVisibility}
                    direction="vertical"
                  />
                  <CodeEditorInEditorResizablePanel
                    problemId={problem.id}
                    contestId={contestId}
                    assignmentId={assignmentId}
                    exerciseId={exerciseId}
                    enableCopyPaste={enableCopyPaste}
                  />
                </ResizablePanel>
                <ResizableHandle className="border-[0.5px] border-slate-700" />
                <ResizablePanel
                  defaultSize={40}
                  className={cn(isBottomPanelHidden && 'hidden')}
                >
                  <TestcasePanel isContest={contestId !== undefined} />
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
  exerciseId?: number
  enableCopyPaste: boolean
}

function CodeEditorInEditorResizablePanel({
  problemId,
  contestId,
  assignmentId,
  exerciseId,
  enableCopyPaste
}: CodeEditorInEditorResizablePanelProps) {
  const { language } = useLanguageStore(
    problemId,
    contestId,
    assignmentId,
    exerciseId
  )()
  const { code, setCode } = useCodeStore()

  return (
    <CodeEditor
      value={code ?? ''}
      language={language}
      onChange={setCode}
      enableCopyPaste={enableCopyPaste}
      showZoom
    />
  )
}

interface HidePanelButtonProps {
  isPanelHidden: boolean
  toggleIsPanelHidden: () => void
  direction: 'horizontal' | 'vertical'
}

function HidePanelButton({
  isPanelHidden,
  toggleIsPanelHidden,
  direction
}: HidePanelButtonProps) {
  return (
    <div
      className={cn(
        direction === 'horizontal'
          ? '-left-2 top-[40%] h-[89px] w-[29px] px-px py-[2px]'
          : '-bottom-2 left-1/2 h-[29px] w-[121px] px-[2px] py-px',
        'absolute z-20 inline-block bg-[#4C5565]',
        direction === 'horizontal'
          ? '[clip-path:polygon(0%_0%,100%_17%,100%_83%,0%_100%)]'
          : '[clip-path:polygon(17%_0%,83%_0%,100%_100%,0%_100%)]'
      )}
    >
      <Button
        className={cn(
          'group',
          direction === 'horizontal'
            ? 'h-[85px] w-[27px]'
            : 'h-[27px] w-[117px]',
          'bg-[#292E3D] p-0',
          'hover:border-[#1F3D74] hover:bg-[#192C52]',
          'active:border-[#25519C] active:bg-[#234B91]',
          direction === 'horizontal'
            ? '[clip-path:polygon(0%_0%,100%_16%,100%_84%,0%_100%)]'
            : '[clip-path:polygon(16%_0%,84%_0%,100%_100%,0%_100%)]'
        )}
        onKeyDown={preventEnterKeyDown}
        onClick={() => {
          toggleIsPanelHidden()
        }}
      >
        {isPanelHidden ? (
          <FiChevronRight
            className={cn(
              'text-[#AAB1B2] group-hover:text-[#619CFB] group-active:text-[#619CFB]',
              direction === 'vertical' && '-rotate-90',
              direction === 'vertical' ? 'mb-1' : 'ml-1'
            )}
            size={20}
          />
        ) : (
          <FiChevronLeft
            className={cn(
              'text-[#AAB1B2] group-hover:text-[#619CFB] group-active:text-[#619CFB]',
              direction === 'vertical' && '-rotate-90',
              direction === 'vertical' ? 'mb-1' : 'ml-1'
            )}
            size={20}
          />
        )}
      </Button>
    </div>
  )
}

const preventEnterKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
  }
}
