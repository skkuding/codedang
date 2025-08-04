'use client'

import { CodeEditor } from '@/components/CodeEditor'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/shadcn/resizable'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { GET_GROUP_MEMBER } from '@/graphql/user/queries'
import type { Language, TestcaseItem, TestResultDetail } from '@/types/type'
import { useSuspenseQuery } from '@apollo/client'
import { useState } from 'react'
import { BiSolidUser } from 'react-icons/bi'
import { IoChevronDown, IoChevronUp } from 'react-icons/io5'
import { TestcasePanel } from './TestcasePanel'

interface ProblemEditorProps {
  code: string
  language: string
  courseId: number
  userId: number
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
  userId,
  setEditorCode,
  isTesting,
  onTest,
  testResults,
  testcases,
  children,
  onReset
}: ProblemEditorProps) {
  const member = useSuspenseQuery(GET_GROUP_MEMBER, {
    variables: {
      groupId: courseId,
      userId
    }
  }).data?.getGroupMember

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)

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
            <p className="text-[18px] font-medium">
              {member?.name}({member?.studentId})
            </p>
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
            {!isPanelCollapsed && (isTesting || testResults.length > 0) && (
              <>
                <ResizableHandle className="border-[0.5px] border-slate-700" />
                <ResizablePanel defaultSize={40} minSize={20}>
                  <div className="flex justify-end px-2 pt-1">
                    <button
                      onClick={() => setIsPanelCollapsed(true)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-700"
                    >
                      <IoChevronDown size={20} />
                    </button>
                  </div>
                  <TestcasePanel
                    data={(() => {
                      if (testResults.length > 0) {
                        return testResults
                      }
                      if (isTesting) {
                        return testcases.map((tc: TestcaseItem) => ({
                          id: Number(tc.id),
                          input: tc.input ?? '',
                          expectedOutput: tc.output ?? '',
                          output: '',
                          result: 'Judging',
                          isUserTestcase: false
                        }))
                      }
                      return []
                    })()}
                    isTesting={isTesting}
                  />
                </ResizablePanel>
              </>
            )}
            {isPanelCollapsed && (
              <div className="absolute bottom-2 right-4 z-50">
                <button
                  onClick={() => setIsPanelCollapsed(false)}
                  className="rounded bg-[#222939] p-2 text-slate-400 shadow hover:bg-slate-700"
                >
                  <IoChevronUp size={22} />
                </button>
              </div>
            )}
          </ResizablePanelGroup>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
