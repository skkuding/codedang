'use client'

import { CodeEditor } from '@/components/CodeEditor'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { GET_GROUP_MEMBERS } from '@/graphql/user/queries'
import { cn } from '@/libs/utils'
import type { Language, TestcaseItem, TestResultDetail } from '@/types/type'
import { useSuspenseQuery } from '@apollo/client'
import type { Route } from 'next'
import Link from 'next/link'
import { BiSolidUser } from 'react-icons/bi'
import { FaSortDown } from 'react-icons/fa'
import { TestcasePanel } from './TestcasePanel'

interface ProblemEditorProps {
  code: string
  language: string
  courseId: number
  assignmentId: number
  userId: number
  problemId: number
  setEditorCode: (code: string) => void
  isTesting: boolean
  onTest: () => void
  testResults: TestResultDetail[]
  testcases: TestcaseItem[]
  children: React.ReactNode
  onReset: () => void
}

export function EditorMainResizablePanel({
  code,
  language,
  courseId,
  assignmentId,
  userId,
  problemId,
  setEditorCode,
  isTesting,
  onTest,
  testResults,
  testcases,
  children,
  onReset
}: ProblemEditorProps) {
  const members =
    useSuspenseQuery(GET_GROUP_MEMBERS, {
      variables: {
        groupId: courseId,
        take: 1000,
        leaderOnly: false
      }
    }).data?.getGroupMembers ?? []

  const currentMember = members.find((member) => member.userId === userId)

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
          <div className="flex h-12 w-full items-center gap-2 border-b border-slate-700 bg-[#222939] px-6">
            <BiSolidUser className="size-6 rounded-none text-gray-300" />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex gap-1 text-lg text-white outline-none">
                <h1>
                  {currentMember?.name}({currentMember?.studentId})
                </h1>
                <FaSortDown />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-slate-700 bg-slate-900">
                {members.map((member) => (
                  <Link
                    href={
                      `/admin/course/${courseId}/assignment/${assignmentId}/assessment/user/${member.userId}/problem/${problemId}` as Route
                    }
                    key={member.userId}
                  >
                    <DropdownMenuItem
                      className={cn(
                        'flex justify-between text-white hover:cursor-pointer focus:bg-slate-800 focus:text-white',
                        currentMember?.userId === member.userId &&
                          'text-primary-light focus:text-primary-light'
                      )}
                    >
                      {member.name}({member.studentId})
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex-1 bg-[#222939]">
            <ScrollArea className="h-full">
              {children}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle className="border-[0.5px] border-slate-700" />
      <ResizablePanel defaultSize={65} className="bg-[#222939]">
        <div className="flex h-full flex-col">
          <div className="flex h-12 items-center gap-2 border-b border-slate-700 bg-[#222939] px-6">
            <div className="flex-1" />
            <button
              onClick={onReset}
              className="rounded bg-gray-500 px-3 py-1 text-white hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              onClick={onTest}
              disabled={isTesting}
              className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
            >
              {isTesting ? 'Testing...' : 'Test'}
            </button>
          </div>

          <ResizablePanelGroup direction="vertical" className="flex-1">
            <ResizablePanel defaultSize={60} className="relative">
              <CodeEditor
                value={code}
                language={language as Language}
                readOnly={false}
                enableCopyPaste={true}
                height="100%"
                className="h-full"
                onChange={setEditorCode}
              />
            </ResizablePanel>
            <ResizableHandle className="border-[0.5px] border-slate-700" />
            <ResizablePanel defaultSize={40} minSize={20}>
              <TestcasePanel
                data={(() => {
                  if (isTesting) {
                    return testResults.map((result) => ({
                      ...result,
                      output: '',
                      result: 'Judging'
                    }))
                  }
                  if (testResults.length > 0) {
                    return testResults
                  }
                  return []
                })()}
                isTesting={isTesting}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
