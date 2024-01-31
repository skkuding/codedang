'use client'

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { useStorage } from '@/lib/hooks'
import type { ProblemDetail } from '@/types/type'
import { tags as t } from '@lezer/highlight'
import type { LanguageName } from '@uiw/codemirror-extensions-langs'
import { loadLanguage } from '@uiw/codemirror-extensions-langs'
import { createTheme } from '@uiw/codemirror-themes'
import type { Extension } from '@uiw/react-codemirror'
import CodeMirror from '@uiw/react-codemirror'
import { Suspense } from 'react'
import Loading from '../loading'
import EditorHeader from './EditorHeader'
import Tab from './Tab'

// 우선 Editor 페이지에서 사용할 데이터들만 받아옴
interface ProblemEditorProps {
  data: ProblemDetail
  children: React.ReactNode
}

export default function MainResizablePanel({
  data,
  children
}: {
  data: ProblemEditorProps['data']
  children: React.ReactNode
}) {
  const editorTheme = createTheme({
    settings: {
      background: '#1E293B',
      foreground: '#9cdcfe',
      caret: '#c6c6c6',
      selection: '#6199ff2f',
      selectionMatch: '#72a1ff59',
      lineHighlight: '#ffffff0f',
      gutterBackground: '#1E293B',
      gutterActiveForeground: '#fff'
    },
    styles: [
      { tag: [t.standard(t.tagName), t.tagName], color: '#7ee787' },
      { tag: [t.comment, t.bracket], color: '#8b949e' },
      { tag: [t.className, t.propertyName], color: '#d2a8ff' },
      {
        tag: [t.variableName, t.attributeName, t.number, t.operator],
        color: '#79c0ff'
      },
      {
        tag: [t.keyword, t.typeName, t.typeOperator, t.typeName],
        color: '#ff7b72'
      },
      { tag: [t.string, t.meta, t.regexp], color: '#a5d6ff' },
      { tag: [t.name, t.quote], color: '#7ee787' },
      { tag: [t.heading, t.strong], color: '#d2a8ff', fontWeight: 'bold' },
      { tag: [t.emphasis], color: '#d2a8ff', fontStyle: 'italic' },
      { tag: [t.deleted], color: '#ffdcd7', backgroundColor: 'ffeef0' },
      { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#ffab70' },
      { tag: t.link, textDecoration: 'underline' },
      { tag: t.strikethrough, textDecoration: 'line-through' },
      { tag: t.invalid, color: '#f97583' }
    ],
    theme: 'dark'
  })
  // get programming language from localStorage
  const [langValue, setValue] = useStorage(
    'programming_lang',
    data.languages[0]
  )

  const editorLang =
    langValue === 'Python3' ? 'python' : langValue?.toLowerCase()

  // if langValue in storage is not in languages, set langValue to the first language
  if (langValue && !data.languages.includes(langValue))
    setValue(data.languages[0])

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="border border-slate-600"
    >
      <ResizablePanel
        defaultSize={35}
        style={{ minWidth: '400px' }}
        minSize={20}
      >
        <div className="grid-rows-editor grid h-full">
          <Tab id={data.id} />
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={65} className="shrink-0 bg-slate-800">
        <div className="grid-rows-editor grid h-full">
          <EditorHeader data={data} langValue={langValue} />
          <div className="h-full overflow-auto">
            <CodeMirror
              theme={editorTheme}
              className="h-full"
              extensions={
                [loadLanguage(editorLang as LanguageName)] as Extension[]
              }
              height="100%"
            />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
