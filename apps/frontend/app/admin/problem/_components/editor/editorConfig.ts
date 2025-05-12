import type { Language } from '@/types/type'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import type { LanguageSupport } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import { EditorView } from '@uiw/react-codemirror'

export const editorTheme = createTheme({
  settings: {
    background: '#121728',
    foreground: '#9cdcfe',
    fontFamily: 'var(--font-mono), monospace',
    caret: '#c6c6c6',
    selection: '#6199ff2f',
    selectionMatch: '#72a1ff59',
    lineHighlight: '#ffffff0f',
    gutterBackground: '#272E48',
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

export const fontSize = EditorView.baseTheme({
  '&': {
    fontSize: '13px'
  }
})

export const languageParser: Record<Language, () => LanguageSupport> = {
  Cpp: cpp,
  C: cpp,
  Java: java,
  Python3: python,
  PyPy3: python
}
