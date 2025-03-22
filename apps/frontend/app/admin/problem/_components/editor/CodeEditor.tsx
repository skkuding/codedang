'use client'

import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import type { Language } from '@generated/graphql'
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import ReactCodeMirror, { lineNumbers } from '@uiw/react-codemirror'
import { editorTheme, fontSize, languageParser } from './editorConfig'
import type { SupportedLanguage } from './formatConfigs'

interface CodeEditorProps extends ReactCodeMirrorProps {
  language: Language
}

export function CodeEditor({
  value,
  language,
  onChange,
  ...props
}: CodeEditorProps) {
  const isSupportedLanguage = (
    language: Language
  ): language is SupportedLanguage => {
    return language !== 'Golang' && language !== 'Python2'
  }

  if (!isSupportedLanguage(language)) {
    console.warn(`Unsupported language: ${language}`)
    return null
  }

  return (
    <ScrollArea className="rounded-md [&>div>div]:h-full">
      <ReactCodeMirror
        theme={editorTheme}
        extensions={[lineNumbers(), fontSize, languageParser[language]()]}
        value={value}
        onChange={onChange}
        basicSetup={{ lineNumbers: false }}
        {...props}
      />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
