'use client'

import SelectScrollable from '@/app/problem/[id]/_components/SelectScrollable'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import CodeMirror from '@uiw/react-codemirror'
import { sanitize } from 'isomorphic-dompurify'
import { useState } from 'react'
import { FiClipboard } from 'react-icons/fi'
import { LuFileText } from 'react-icons/lu'
import { TbReload } from 'react-icons/tb'

// 우선 Editor 페이지에서 사용할 데이터들만 받아옴
interface MainResizablePanelProps {
  data: {
    id: number
    title: string
    description: string
    inputDescription: string
    outputDescription: string
    inputExamples: string[]
    outputExamples: string[]
    languages: string[]
    timeLimit: number
    memoryLimit: number
  }
}

export default function MainResizablePanel({ data }: MainResizablePanelProps) {
  const [tag, setTag] = useState(false) // tag button on/off
  const [page, setPage] = useState('desc') // description/submission which page

  const editorTheme = createTheme({
    theme: 'dark',
    settings: {
      background: '#1E293B',
      backgroundImage: '',
      foreground: '#75baff',
      caret: '#5d00ff',
      selection: '#036dd626',
      selectionMatch: '#036dd626',
      lineHighlight: '#8a91991a',
      gutterBackground: '#1E293B',
      gutterForeground: '#8a919966'
    },
    styles: [
      { tag: t.comment, color: '#787b8099' },
      { tag: t.variableName, color: '#0080ff' },
      { tag: [t.string, t.special(t.brace)], color: '#5c6166' },
      { tag: t.number, color: '#5c6166' },
      { tag: t.bool, color: '#5c6166' },
      { tag: t.null, color: '#5c6166' },
      { tag: t.keyword, color: '#5c6166' },
      { tag: t.operator, color: '#5c6166' },
      { tag: t.className, color: '#5c6166' },
      { tag: t.definition(t.typeName), color: '#5c6166' },
      { tag: t.typeName, color: '#5c6166' },
      { tag: t.angleBracket, color: '#5c6166' },
      { tag: t.tagName, color: '#5c6166' },
      { tag: t.attributeName, color: '#5c6166' }
    ]
  })

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel
        defaultSize={35}
        style={{ overflowY: 'auto' }}
        minSize={20}
      >
        <div className="flex flex-col gap-y-4 pb-4 pl-6 pr-8">
          <div className="flex h-[51px] items-center">
            <div className="flex gap-5 text-lg">
              <h1
                className={cn('cursor-pointer', page == 'desc' && 'font-bold')}
                onClick={() => {
                  setPage('desc')
                }}
              >
                Description
              </h1>
              <h1
                className={cn('cursor-pointer', page == 'subm' && 'font-bold')}
                onClick={() => {
                  setPage('subm')
                }}
              >
                Submissions
              </h1>
            </div>
          </div>
          <div className="text-lg font-bold">{`#${data.id}. ${data.title}`}</div>
          <div
            className="text-sm text-slate-300"
            dangerouslySetInnerHTML={{ __html: sanitize(data.description) }}
          />
          <div>
            <div className="mb-3 text-lg">Input</div>
            <div
              className="text-sm text-slate-300"
              dangerouslySetInnerHTML={{
                __html: sanitize(data.inputDescription)
              }}
            />
          </div>
          <div>
            <div className="mb-3 text-lg">Output</div>
            <div
              className="text-sm text-slate-300"
              dangerouslySetInnerHTML={{
                __html: sanitize(data.outputDescription)
              }}
            />
          </div>
          <div>
            <div className="flex justify-between">
              <div className="mb-2 mt-3 text-lg">Sample Input 1</div>
              <div className="flex items-center justify-center">
                <FiClipboard className="cursor-pointer" />
              </div>
            </div>
            <div className="h-24 w-full bg-slate-800 p-2">
              {/* 임시 Sample description -> use inputExamples later*/}
              <p className="text-slate-300">
                A description of the Sample Input 1.
              </p>
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <div className="mb-2 mt-3 text-lg">Sample Output 1</div>
            </div>
            <div className="h-24 w-full bg-slate-800 p-2">
              {/* 임시 Sample description -> use outputExamples later*/}
              <p className="text-slate-300">
                A description of the Sample Output 1.
              </p>
            </div>
          </div>
          <div className="text-lg">{`Time Limit: ${data.timeLimit} ms`}</div>
          <div className="text-lg">{`Memory Limit: ${data.memoryLimit} MB`}</div>
          <div className="mb-2 text-lg">
            {/* TODO: need writer name at api*/}
            Writer: Gildong Hong
          </div>
          <div className="flex h-24 flex-col gap-2">
            <div className="flex items-center justify-start gap-2">
              <div className="text-lg">Tags</div>
              <Switch
                onClick={() => {
                  setTag((tag: boolean) => !tag)
                }}
                className="hover:border-primary"
              />
            </div>
            {tag && <div>tag button on 됐을때 tag들 들어갈 자리</div>}
          </div>
          <div className="flex gap-3">
            {/* 임시 이모티콘 이용 -> 해당 이모티콘 찾는중 */}
            <LuFileText className="size-7" />
            <p className="text-xs">
              Compile Version <br /> Documentation
            </p>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={65} className="bg-slate-800">
        <div className="flex h-[51px] shrink-0 justify-between border-b border-b-slate-600">
          <div className="ml-6 flex items-center justify-center gap-4">
            <div className="cursor-pointer text-lg font-bold">Editor</div>
          </div>
          <div className="mr-5 flex items-center gap-3">
            <Button size="icon" className="size-7 rounded-[5px] bg-slate-500">
              <TbReload className="size-4" />
            </Button>
            <Button className="bg-primary h-7 rounded-[5px] px-2">
              <span className="font-semibold">Submit</span>
            </Button>
            <SelectScrollable languages={data.languages} />
          </div>
        </div>
        <CodeMirror theme={editorTheme} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
