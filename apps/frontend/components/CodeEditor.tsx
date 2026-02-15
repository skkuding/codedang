'use client'

import type { Language } from '@/types/type'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, indentWithTab } from '@codemirror/commands'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import type { LanguageSupport } from '@codemirror/language'
import { indentUnit } from '@codemirror/language'
import { keymap } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { createTheme } from '@uiw/codemirror-themes'
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror'
import type { ReactCodeMirrorRef } from '@uiw/react-codemirror'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useRef } from 'react'
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
  },
  '.cm-scroller': {
    height: '100%'
  },
  '.cm-content': {
    minHeight: '100%'
  }
})

const gutterStyle = EditorView.baseTheme({
  '.cm-lineNumbers .cm-gutterElement': {
    paddingLeft: '30px'
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

  const cmRef = useRef<ReactCodeMirrorRef>(null)

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 rounded-lg bg-[#121728]">
        <div
          className="h-full"
          onMouseDownCapture={(e) => {
            const view = cmRef.current?.view
            if (!view) {
              return
            }

            const target = e.target as HTMLElement
            if (target.closest('.cm-editor')) {
              return
            }

            e.preventDefault()

            requestAnimationFrame(() => {
              view.focus()
            })
          }}
        >
          <ReactCodeMirror
            ref={cmRef}
            theme={editorTheme}
            extensions={[
              indentUnit.of('    '),
              languageParser[language](),
              enableCopyPaste ? [] : copyPasteHandler(),
              closeBrackets(),
              keymap.of([
                ...closeBracketsKeymap,
                ...defaultKeymap,
                indentWithTab
              ]),
              editorPadding,
              gutterStyle,
              fontSizeTheme
            ]}
            className="h-full"
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            {...props}
          />
        </div>
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
