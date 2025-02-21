'use client'

import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import type { Language } from '@/types/type'
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import ReactCodeMirror, { lineNumbers } from '@uiw/react-codemirror'
import { checkboxGutter } from './GutterCheckbox'
import { editorTheme, fontSize, languageParser } from './editorConfig'

interface LineSelectableCodeEditorProps extends ReactCodeMirrorProps {
  language: Language
}

export function LineSelectableCodeEditor({
  value,
  language,
  onChange,
  ...props
}: LineSelectableCodeEditorProps) {
  return (
    <ScrollArea className="rounded-md [&>div>div]:h-full">
      <ReactCodeMirror
        theme={editorTheme}
        extensions={[
          ...checkboxGutter,
          lineNumbers(), // checkboxGutter 뒤에 lineNumbers가 오도록 명시
          fontSize,
          languageParser[language]()
        ]}
        value={value}
        onChange={onChange}
        basicSetup={{ lineNumbers: false }} // 기존 lineNumbers 비활성화 (중복 방지)
        {...props}
      />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
