'use client'

import type { Language } from '@/types/type'
import { tags as t } from '@lezer/highlight'
import type { LanguageName } from '@uiw/codemirror-extensions-langs'
import { loadLanguage } from '@uiw/codemirror-extensions-langs'
import { createTheme } from '@uiw/codemirror-themes'
import type { Extension, ReactCodeMirrorProps } from '@uiw/react-codemirror'
import ReactCodeMirror from '@uiw/react-codemirror'
import { ScrollArea, ScrollBar } from './ui/scroll-area'

const editorTheme = createTheme({
  settings: {
    background: '#0f172a',
    foreground: '#9cdcfe',
    fontFamily: 'var(--font-ibm-plex-mono), monospace',
    caret: '#c6c6c6',
    selection: '#6199ff2f',
    selectionMatch: '#72a1ff59',
    lineHighlight: '#ffffff0f',
    gutterBackground: '#0f172a',
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

interface Props extends ReactCodeMirrorProps {
  language: Language
}

const CodeMirrorLanguage: Record<Language, LanguageName> = {
  C: 'c',
  Cpp: 'cpp',
  Golang: 'go',
  Java: 'java',
  Python2: 'python',
  Python3: 'python'
}

export default function CodeEditor({
  value,
  language,
  onChange,
  readOnly: readOnly = false,
  ...props
}: Props) {
  return (
    <ScrollArea className="rounded-md [&>div>div]:h-full">
      <ReactCodeMirror
        theme={editorTheme}
        extensions={[loadLanguage(CodeMirrorLanguage[language])] as Extension[]}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        {...props}
      />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
