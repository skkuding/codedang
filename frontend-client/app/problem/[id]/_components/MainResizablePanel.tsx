'use client'

import SelectScrollable from '@/app/problem/[id]/_components/SelectScrollable'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import CodeMirror from '@uiw/react-codemirror'
import { TbReload } from 'react-icons/tb'
import Description from './Description'

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
        <Description data={data} />
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
