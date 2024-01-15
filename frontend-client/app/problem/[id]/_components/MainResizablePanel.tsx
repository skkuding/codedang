'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { Switch } from '@/components/ui/switch'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import CodeMirror from '@uiw/react-codemirror'
import { sanitize } from 'isomorphic-dompurify'
import { useState } from 'react'
import { FiClipboard } from 'react-icons/fi'
import { LuFileText } from 'react-icons/lu'

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
  }
}

export default function MainResizablePanel({ data }: MainResizablePanelProps) {
  const [tag, setTag] = useState(false) // tag button on/off

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
        <div className="flex flex-col gap-y-4 py-4 pl-6 pr-8">
          <div>
            <h1 className="mb-4 text-lg">Description</h1>
            <div
              className="text-sm text-slate-300"
              dangerouslySetInnerHTML={{ __html: sanitize(data.description) }}
            />
          </div>
          <div>
            <h1 className="mb-3 text-lg">Input</h1>
            <div
              className="text-sm text-slate-300"
              dangerouslySetInnerHTML={{
                __html: sanitize(data.inputDescription)
              }}
            />
          </div>
          <div>
            <h1 className="mb-3 text-lg">Output</h1>
            <div
              className="text-sm text-slate-300"
              dangerouslySetInnerHTML={{
                __html: sanitize(data.outputDescription)
              }}
            />
          </div>
          <div>
            <div className="flex justify-between">
              <h1 className="mb-2 mt-3 text-lg">Sample Input 1</h1>
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
              <h1 className="mb-2 mt-3 text-lg">Sample Output 1</h1>
            </div>
            <div className="h-24 w-full bg-slate-800 p-2">
              {/* 임시 Sample description -> use outputExamples later*/}
              <p className="text-slate-300">
                A description of the Sample Output 1.
              </p>
            </div>
          </div>
          <div>
            {/* TODO: need writer name at api*/}
            <h1 className="mb-2 text-lg">Writer: Gildong Hong</h1>
          </div>
          <div className="flex h-28 flex-col gap-2">
            <div className="flex items-center justify-start gap-2">
              <div>Tag</div>
              <Switch
                onClick={() => {
                  setTag((tag: boolean) => !tag)
                }}
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
        <CodeMirror theme={editorTheme} />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
