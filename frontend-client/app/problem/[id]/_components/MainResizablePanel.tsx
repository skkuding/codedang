'use client'

import SelectScrollable from '@/app/problem/[id]/_components/SelectScrollable'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { tags as t } from '@lezer/highlight'
// import { loadLanguage } from '@uiw/codemirror-extensions-langs'
import { createTheme } from '@uiw/codemirror-themes'
import CodeMirror from '@uiw/react-codemirror'
// import { useState } from 'react'
import { TbReload } from 'react-icons/tb'
import Tab from './Tab'

// 우선 Editor 페이지에서 사용할 데이터들만 받아옴
interface ProblemEditorProps {
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
  tabs: React.ReactNode
}

export default function MainResizablePanel({
  data,
  // children
  tabs
}: {
  data: ProblemEditorProps['data']
  tabs: React.ReactNode
}) {
  // code editor에 사용할 언어 선택
  // const [selectLang, setSelectLang] = useState(data.languages[0].toLowerCase())
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
        style={{ overflowY: 'auto', minWidth: '400px' }}
        minSize={20}
      >
        <Tab id={data.id} />
        {tabs}
      </ResizablePanel>

      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={65}
        className="bg-slate-800"
        style={{ overflowY: 'auto' }}
      >
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
            <SelectScrollable
              languages={data.languages}
              // setLang={setSelectLang}
            />
          </div>
        </div>
        <CodeMirror
          theme={editorTheme}
          // extensions={[loadLanguage(selectLang)] as any}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
