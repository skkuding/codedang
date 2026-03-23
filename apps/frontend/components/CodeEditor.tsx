'use client'

import type { Language } from '@/types/type'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import type { LanguageSupport } from '@codemirror/language'
import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, ViewPlugin, type ViewUpdate } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { FaPlus, FaMinus, FaArrowRotateLeft } from 'react-icons/fa6'
import { toast } from 'sonner'
import { Button } from './shadcn/button'
import { ScrollArea, ScrollBar } from './shadcn/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from './shadcn/tooltip'

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

const editorPadding = EditorView.baseTheme({
  '.cm-editor': {
    padding: '8px',
    height: '100%'
  }
})

const gutterStyle = EditorView.baseTheme({
  '.cm-lineNumbers .cm-gutterElement': {
    paddingLeft: '30px'
  }
})

const highlightTheme = EditorView.baseTheme({
  '.cm-line.cm-highlighted-pair-0': {
    backgroundColor: 'rgba(248, 113, 113, 0.22)'
  },
  '.cm-line.cm-highlighted-pair-1': {
    backgroundColor: 'rgba(251, 146, 60, 0.22)'
  },
  '.cm-line.cm-highlighted-pair-2': {
    backgroundColor: 'rgba(250, 204, 21, 0.22)'
  },
  '.cm-line.cm-highlighted-pair-3': {
    backgroundColor: 'rgba(52, 211, 153, 0.22)'
  },
  '.cm-line.cm-highlighted-pair-4': {
    backgroundColor: 'rgba(56, 189, 248, 0.22)'
  },
  '.cm-line.cm-highlighted-pair-5': {
    backgroundColor: 'rgba(129, 140, 248, 0.22)'
  },
  '.cm-line.cm-highlighted-pair-6': {
    backgroundColor: 'rgba(244, 114, 182, 0.22)'
  },
  '.cm-line.cm-highlighted-pair-7': {
    backgroundColor: 'rgba(248, 250, 252, 0.22)'
  },
  '.cm-line.cm-highlighted-pair-8': {
    backgroundColor: 'rgba(148, 163, 184, 0.22)'
  },
  '.cm-line.cm-highlighted-pair-9': {
    backgroundColor: 'rgba(34, 197, 94, 0.22)'
  }
})

const languageParser: Record<Language, () => LanguageSupport> = {
  Cpp: cpp,
  C: cpp,
  Java: java,
  Python3: python,
  PyPy3: python
}

interface CodeEditorProps extends ReactCodeMirrorProps {
  language: Language
  enableCopyPaste?: boolean
  showZoom?: boolean
  highlightLines?: number[]
  highlightClassName?: string
  multiHighlightRanges?: { line: number; className: string }[]
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

const useLongPress = (callback: () => void) => {
  const [startLongPress, setStartLongPress] = useState(false)

  useEffect(() => {
    let longPressTimer: NodeJS.Timeout
    let longPressInterval: NodeJS.Timeout
    if (startLongPress) {
      longPressTimer = setTimeout(() => {
        longPressInterval = setInterval(() => {
          callback()
        }, 100)
      }, 500)
    }
    return () => {
      clearTimeout(longPressTimer)
      clearInterval(longPressInterval)
    }
  }, [startLongPress, callback])

  return {
    onPointerDown: () => setStartLongPress(true),
    onPointerUp: () => setStartLongPress(false)
  }
}

const MotionButton = motion.create(Button)

export function CodeEditor({
  value,
  language,
  onChange,
  enableCopyPaste = true,
  readOnly = false,
  showZoom = false,
  highlightLines,
  highlightClassName,
  multiHighlightRanges,
  ...props
}: CodeEditorProps) {
  const [fontSize, setFontSize] = useState(16)
  const fontSizeTheme = EditorView.theme({
    '&': {
      fontSize: `${fontSize}px`
    }
  })

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(prev + 2, 120))
  }, [])
  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(prev - 2, 6))
  }, [])

  const { onPointerDown: startLongPlus, onPointerUp: stopLongPlus } =
    useLongPress(increaseFontSize)
  const { onPointerDown: startLongMinus, onPointerUp: stopLongMinus } =
    useLongPress(decreaseFontSize)

  const highlightExtension = useMemo(() => {
    const hasRanges = multiHighlightRanges && multiHighlightRanges.length > 0
    const hasLines =
      highlightLines && highlightLines.length > 0 && highlightClassName

    if (!hasRanges && !hasLines) {
      return null
    }

    return ViewPlugin.fromClass(
      class {
        decorations
        constructor(view: EditorView) {
          this.decorations = this.buildDecorations(view)
        }

        update(update: ViewUpdate) {
          if (update.docChanged || update.viewportChanged) {
            this.decorations = this.buildDecorations(update.view)
          }
        }

        buildDecorations(view: EditorView) {
          const builder = new RangeSetBuilder<Decoration>()

          if (multiHighlightRanges && multiHighlightRanges.length > 0) {
            const sortedRanges = [...multiHighlightRanges].sort(
              (a, b) => a.line - b.line
            )

            sortedRanges.forEach(({ line, className }) => {
              if (line <= 0 || line > view.state.doc.lines) {
                return
              }
              const lineInfo = view.state.doc.line(line)
              const deco = Decoration.line({
                attributes: { class: className }
              })
              builder.add(lineInfo.from, lineInfo.from, deco)
            })
          } else if (
            highlightLines &&
            highlightLines.length > 0 &&
            highlightClassName
          ) {
            const sortedLines = [...highlightLines].sort((a, b) => a - b)

            sortedLines.forEach((lineNumber) => {
              if (lineNumber <= 0 || lineNumber > view.state.doc.lines) {
                return
              }
              const lineInfo = view.state.doc.line(lineNumber)
              const deco = Decoration.line({
                attributes: { class: highlightClassName }
              })
              builder.add(lineInfo.from, lineInfo.from, deco)
            })
          }

          return builder.finish()
        }
      },
      {
        decorations: (v) => v.decorations
      }
    )
  }, [multiHighlightRanges, highlightLines, highlightClassName])

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 rounded-lg bg-[#121728]">
        <ReactCodeMirror
          theme={editorTheme}
          extensions={[
            languageParser[language](),
            enableCopyPaste ? [] : copyPasteHandler(),
            editorPadding,
            gutterStyle,
            highlightTheme,
            fontSizeTheme,
            ...(highlightExtension ? [highlightExtension] : [])
          ]}
          className="h-full"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          {...props}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {showZoom && (
        <div className="flex w-full flex-none items-center justify-end gap-1 border-t border-slate-700 bg-[#121728] px-4 py-1.5">
          <TooltipProvider>
            <AnimatePresence>
              {fontSize !== 16 && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MotionButton
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-slate-100/60 hover:bg-slate-500/30 active:bg-slate-500/40"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        onClick={() => setFontSize(16)}
                      >
                        <FaArrowRotateLeft />
                      </MotionButton>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset Font Size</p>
                    </TooltipContent>
                  </Tooltip>
                  <motion.div
                    className="w-12 px-1 text-center text-sm text-slate-100/60"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    {fontSize}px
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-slate-100/60 hover:bg-slate-500/30 active:bg-slate-500/40"
                  onPointerDown={() => startLongPlus()}
                  onPointerUp={() => stopLongPlus()}
                  onClick={() => setFontSize((prev) => Math.min(prev + 2, 120))}
                >
                  <FaPlus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Increase Font Size</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-slate-100/60 hover:bg-slate-500/30 active:bg-slate-500/40"
                  onPointerDown={() => startLongMinus()}
                  onPointerUp={() => stopLongMinus()}
                  onClick={() => setFontSize((prev) => Math.max(prev - 2, 6))}
                >
                  <FaMinus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Decrease Font Size</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
