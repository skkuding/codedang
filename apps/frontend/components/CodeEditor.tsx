'use client'

import type { Language } from '@/types/type'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import type { LanguageSupport } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import readOnlyRangesExtension from 'codemirror-readonly-ranges'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ScrollArea, ScrollBar } from './shadcn/scroll-area'

const editorTheme = createTheme({
  settings: {
    background: '#121728',
    foreground: '#9cdcfe',
    fontFamily: 'var(--font-mono), monospace',
    caret: '#c6c6c6',
    selection: '#6199ff2f',
    selectionMatch: '#72a1ff59',
    lineHighlight: '#ffffff0f',
    gutterBackground: '#121728',
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

const fontSize = EditorView.baseTheme({
  '&': {
    fontSize: '17px'
  }
})

const languageParser: Record<Language, () => LanguageSupport> = {
  Cpp: cpp,
  C: cpp,
  Java: java,
  Python3: python
}

// 사용자가 작성한 주석이 포함된 라인 번호 찾기
const getCommentedLines = (code: string): number[] => {
  const lines = code.split('\n')
  const commentedLines: number[] = []
  let blockComment = false

  // 여러 언어 주석 패턴 추가
  const commentPatterns = {
    blockStart: ['/*', '/**', "'''", '"""'], // JS, Python, Markdown 지원
    blockEnd: ['*/', "'''", '"""']
  }

  lines.forEach((line, index) => {
    // 여러 줄 주석 시작 감지
    if (commentPatterns.blockStart.some((pattern) => line.includes(pattern))) {
      blockComment = true
    }

    // 블록 주석 내부에 있는 경우만 저장
    if (blockComment) {
      commentedLines.push(index + 1) // 1-based index 유지
    }

    // 여러 줄 주석 종료 감지
    if (commentPatterns.blockEnd.some((pattern) => line.includes(pattern))) {
      blockComment = false
    }
  })

  return [...new Set(commentedLines)] // 중복 제거 후 반환
}

// 읽기 전용 코드 블록 라인 번호 가져오기
const getReadOnlyRanges = (
  targetState: EditorState
): { from: number; to: number }[] => {
  const readOnlyLines: { from: number; to: number }[] = []
  const lines = targetState.doc.toString().split('\n')

  // 특정 라인을 읽기 전용으로 설정
  const readOnlySections = [
    {
      from: 1,
      to: 3
    }, // read-only: 1~3
    {
      from: 5,
      to: 8
    }, // read-only: 5~8
    {
      from: lines.length,
      to: lines.length
    } // 마지막 라인
  ]

  readOnlySections.forEach((section) => {
    const from = section.from ?? 0 // undefined 방지
    const to = section.to ?? from // undefined 방지
    readOnlyLines.push({ from, to })
  })

  return readOnlyLines
}
/* 읽기 전용 범위 설정 (유동적으로 적용)
const getReadOnlyRanges = (
  targetState: EditorState
): Array<{ from: number | undefined; to: number | undefined }> => {
  return [
    {
      from: undefined, //same as: targetState.doc.line(0).from or 0
      to: targetState.doc.line(3).to
    },
    {
      from: targetState.doc.line(5).from, //same as: targetState.doc.line(0).from or 0
      to: targetState.doc.line(8).to
    },
    {
      from: targetState.doc.line(targetState.doc.lines).from,
      to: undefined // same as: targetState.doc.line(targetState.doc.lines).to
    }
  ]
}
*/

interface Props extends ReactCodeMirrorProps {
  language: Language
  enableCopyPaste?: boolean
  enableReadOnlyRanges?: boolean // ✅ 추가: 읽기 전용 범위 적용 여부
}

const copyPasteHandler = () => {
  return EditorView.domEventHandlers({
    paste(event) {
      toast.error('Copying and pasting is not allowed')
      event.preventDefault()
    },
    copy(event) {
      toast.error('Copying and pasting is not allowed')
      event.preventDefault()
    },
    cut(event) {
      toast.error('Copying and pasting is not allowed')
      event.preventDefault()
    }
  })
}

export function CodeEditor({
  value,
  language,
  onChange,
  enableCopyPaste = true,
  readOnly = false,
  ...props
}: Props) {
  const [code, setCode] = useState(value || '')

  useEffect(() => {
    if (code) {
      const commentedLines = getCommentedLines(code)
      const readOnlyLines = getReadOnlyRanges(EditorState.create({ doc: code }))

      // ✅ 사용자가 읽기 전용 블록을 주석 처리했는지 확인
      const intersectingLines = commentedLines.filter(
        (line) =>
          readOnlyLines.some((range) => line >= range.from && line <= range.to) // 범위 비교 방식 수정
      )
      console.log('🔍 Commented Lines:', commentedLines) // 주석 처리 라인
      console.log('🔍 Read-Only Lines:', readOnlyLines) // lock 처리 라인
      console.log('🚨 Intersecting Lines:', intersectingLines) // 주석이 겹치는 라인 출력

      if (intersectingLines.length > 0) {
        toast.error(
          `⚠️ 주석이 읽기 전용 코드(${intersectingLines.join(', ')})를 포함할 수 없습니다.`
        )
      }
    }
  }, [code])

  return (
    <ScrollArea className="rounded-md [&>div>div]:h-full">
      <ReactCodeMirror
        theme={editorTheme}
        extensions={[
          fontSize,
          languageParser[language](),
          readOnlyRangesExtension(getReadOnlyRanges),
          enableCopyPaste
            ? []
            : EditorView.domEventHandlers({
                paste: (event) => {
                  toast.error('Copying and pasting is not allowed')
                  event.preventDefault()
                }
              })
        ]}
        value={`read-only line 1
read-only line 2
read-only line 3
<Here you can modify>
read-only line 4
read-only line 1
read-only line 2
read-only line 3
<Here you can modify>
read-only line 4
read-only line 1
read-only line 2
read-only line 3
<Here you can modify>
read-only line 4`}
        onChange={(newValue) => {
          //console.log('📝 코드 변경됨:', newValue)
          setCode(newValue) // 코드 업데이트 → useEffect 실행됨
        }}
        readOnly={readOnly}
        {...props}
      />
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
