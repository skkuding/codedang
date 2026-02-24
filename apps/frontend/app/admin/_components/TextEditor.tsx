'use client'

import { Button } from '@/components/shadcn/button'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { cn } from '@/libs/utils'
import Expand from '@/public/icons/texteditor-expand.svg'
import Shrink from '@/public/icons/texteditor-shrink.svg'
import Code from '@tiptap/extension-code'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Heading from '@tiptap/extension-heading'
import { Image as ImageExtension } from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Underline from '@tiptap/extension-underline'
import { TextSelection, NodeSelection } from '@tiptap/pm/state'
import {
  useEditor,
  EditorContent,
  mergeAttributes,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  Node
} from '@tiptap/react'
import type { NodeViewWrapperProps } from '@tiptap/react'
import { Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useTranslate } from '@tolgee/react'
import 'highlight.js/styles/github-dark.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { common, createLowlight } from 'lowlight'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CodeBlockComponent } from './tiptap/CodeBlockComponent'
import { FileDownloadNode } from './tiptap/FileDownloadNode'
import { HeadingStyleBar } from './tiptap/HeadingStyleBar'
import {
  InsertNodeBar,
  type InsertNodeBarHandles
} from './tiptap/InsertNodeBar'
import { ListStyleBar } from './tiptap/ListStyleBar'
import { TextStyleBar } from './tiptap/TextStyleBar'
import { UndoRedoBar } from './tiptap/UndoRedoBar'
import { Commands, type CommandProps } from './tiptap/commands'
import { getSuggestionItems } from './tiptap/items'
import { renderItems } from './tiptap/renderItems'

interface TextEditorProps {
  placeholder: string
  onChange: (richText: string) => void
  defaultValue?: string
  isDarkMode?: boolean
  isExpanded?: boolean
  onShrink?: (richText: string) => void
}

export function TextEditor({
  placeholder,
  onChange,
  defaultValue,
  isDarkMode = false,
  isExpanded = false,
  onShrink
}: TextEditorProps) {
  const { t } = useTranslate()
  const lowlight = createLowlight(common)

  const insertNodeRef = useRef<InsertNodeBarHandles>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: false,
        heading: false
      }),
      Code.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-medium'
        }
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent)
        }
      }).configure({
        lowlight
      }),
      Indentation,
      Placeholder.configure({
        placeholder: ({ editor }) =>
          editor.getHTML() === '<p></p>' ? placeholder : '',
        emptyEditorClass:
          'before:absolute before:text-gray-300 before:float-left before:content-[attr(data-placeholder)] before:pointer-events-none'
      }),
      Underline,
      ImageExtension,
      FileDownloadNode,
      MathExtension as Extension,
      Heading.configure({ levels: [1, 2, 3] }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
        protocols: ['http', 'https'],
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(':')
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`)

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false
            }

            // disallowed protocols
            const disallowedProtocols = ['ftp', 'file', 'mailto']
            const protocol = parsedUrl.protocol.replace(':', '')

            if (disallowedProtocols.includes(protocol)) {
              return false
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === 'string' ? p : p.scheme
            )

            if (!allowedProtocols.includes(protocol)) {
              return false
            }

            // disallowed domains
            const disallowedDomains = [
              'example-phishing.com',
              'malicious-site.net'
            ]
            const domain = parsedUrl.hostname

            if (disallowedDomains.includes(domain)) {
              return false
            }

            // all checks have passed
            return true
          } catch {
            return false
          }
        }
      }),
      Table,
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border bg-white '
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border bg-white'
        }
      }),
      Commands.configure({
        suggestion: {
          char: '/',
          startOfLine: false,
          command: ({ editor, range, props }: CommandProps) => {
            props.command({ editor, range, props })
          },
          render: renderItems,
          items: ({ query }: { query?: string }) =>
            getSuggestionItems(
              query,
              () => insertNodeRef.current?.openImageDialog(),
              () => insertNodeRef.current?.openFileDialog(),
              () => insertNodeRef.current?.openTableDialog()
            )
        }
      })
    ],
    editorProps: {
      attributes: {
        class: `focus:outline-none overflow-y-auto w-full disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
          isExpanded ? 'h-[500px]' : 'h-[144px]'
        }`
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
    content: defaultValue
  })
  const [isExpandedScreenOpen, setIsExpandedScreenOpen] = useState(false)

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-[4px]',
        isDarkMode ? 'border-editor-line-1 border bg-transparent' : 'border'
      )}
    >
      {editor && (
        <div
          className={cn(
            'flex flex-wrap items-center border-b px-1 py-2',
            isDarkMode
              ? 'border-editor-line-1 bg-editor-fill-1 text-white [&_button:hover]:!bg-white/10 [&_button]:text-white [&_img]:invert [&_path]:fill-white [&_svg]:text-white'
              : 'bg-white'
          )}
        >
          <TextStyleBar editor={editor} />
          <HeadingStyleBar editor={editor} />
          <ListStyleBar editor={editor} />
          <InsertNodeBar ref={insertNodeRef} editor={editor} />

          <div className="mx-1 h-6 shrink-0 border-r" />
          <UndoRedoBar editor={editor} />
          {isExpanded ? (
            <div className="ml-auto flex space-x-2">
              <Button
                variant="ghost"
                type="button"
                className="h-9 w-9 p-1"
                onClick={() => onShrink?.(editor?.getHTML())}
              >
                <Image
                  src={Shrink}
                  alt="Shrink"
                  className="h-[22px] w-[22px]"
                />
              </Button>
            </div>
          ) : (
            <div className="ml-auto flex space-x-2">
              <Button
                variant="ghost"
                type="button"
                className="h-9 w-9 p-1"
                onClick={() => {
                  setIsExpandedScreenOpen(!isExpandedScreenOpen)
                }}
              >
                <Image
                  src={Expand}
                  alt="Expand"
                  className="h-[22px] w-[22px]"
                />
              </Button>
            </div>
          )}
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          'prose w-full max-w-none overflow-hidden bg-white p-4 [&_code::after]:content-none [&_code::before]:content-none [&_h1]:mb-4 [&_h1]:mt-6 [&_h2]:mb-3 [&_h2]:mt-5 [&_h3]:mb-2 [&_h3]:mt-4 [&_p]:mb-0 [&_p]:mt-2',
          isDarkMode && 'prose-invert bg-editor-fill-1'
        )}
      />
      {!isExpanded && (
        <Dialog open={isExpandedScreenOpen}>
          <DialogContent
            className="max-w-5xl !border-none !bg-transparent !p-0"
            hideCloseButton={true}
          >
            <TextEditor
              placeholder={t('editor_placeholder')}
              onChange={onChange}
              defaultValue={editor?.getHTML()}
              isExpanded={true}
              onShrink={(content) => {
                editor?.commands.setContent(content)
                setIsExpandedScreenOpen(false)
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export const Indentation = Extension.create({
  name: 'indentation',
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const { state, dispatch } = editor.view
        const { selection } = state
        const transaction = state.tr.insertText(
          '    ',
          selection.from,
          selection.to
        )
        dispatch(transaction)
        return true
      }
    }
  }
})

export const MathExtension = Node.create({
  name: 'mathComponent',
  group: 'inline',
  content: 'text*',
  inline: true,
  atom: true,
  defining: true,
  isolating: true,
  draggable: false,
  selectable: true,

  addAttributes() {
    return {
      content: {
        default: '',
        renderHTML: (attributes) => {
          return {
            content: attributes.content
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'math-component'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['math-component', mergeAttributes(HTMLAttributes, { math: '' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathPreview)
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive(this.name)) {
          return true // 수식 내부에서 Enter 키 차단
        }
        return false
      }
    }
  }
})

function MathPreview(props: NodeViewWrapperProps) {
  const { t } = useTranslate()

  const [content, setContent] = useState(props.node.attrs.content)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setContent(props.node.attrs.content)
  }, [props.node.attrs.content])

  useEffect(() => {
    const { editor } = props

    if (props.selected) {
      const { state } = editor?.view || {}
      const { selection } = state || {}

      const isRangeSelection =
        selection &&
        selection instanceof TextSelection &&
        selection.from !== selection.to

      const isNodeSelection = selection && selection instanceof NodeSelection

      if (isRangeSelection) {
        console.log('range')
        setIsEditing(false)
      } else if ((isNodeSelection || props.selected) && !isEditing) {
        console.log('node')
        setIsEditing(true)
        setTimeout(() => {
          inputRef.current?.focus()
          inputRef.current?.select()
        }, 10)
      }
    } else if (content === '') {
      console.log('focused')
      setTimeout(() => {
        inputRef.current?.focus()
        setIsEditing(true)
      }, 10)
    } else {
      setIsEditing(false)
    }
  }, [props.selected, props.editor?.state, isEditing, props])

  const handleContentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContent(event.target.value)
  }

  const handleApply = () => {
    props.updateAttributes({
      content
    })
    setIsEditing(false)
    const { editor, getPos } = props
    const pos = getPos() + props.node.nodeSize

    editor.commands.setTextSelection(pos)
    editor.commands.blur()

    setTimeout(() => {
      editor.commands.focus()
    }, 10)
    if (content.trim() === '') {
      props.deleteNode()
      return
    }
  }

  // Enter 키 누르면 적용
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && isEditing) {
      event.preventDefault()
      handleApply()
    } else if (event.key === 'Escape') {
      setContent(props.node.attrs.content)
      setIsEditing(false)

      const { editor, getPos } = props
      const pos = getPos() + props.node.nodeSize

      editor.commands.setTextSelection(pos)
      editor.commands.blur()

      setTimeout(() => {
        editor.commands.focus()
      }, 10)
      if (content.trim() === '') {
        props.deleteNode()
        return
      }
      event.preventDefault()
    } else if (
      event.key === 'ArrowLeft' &&
      event.currentTarget instanceof HTMLInputElement &&
      event.currentTarget.selectionStart === 0 &&
      event.currentTarget.selectionEnd === 0
    ) {
      const { editor } = props
      const pos = editor.state.selection.from
      editor.commands.setTextSelection(pos)
      setTimeout(() => {
        editor.commands.focus()
      }, 10)
      if (content.trim() === '') {
        props.deleteNode()
        return
      }
    } else if (
      event.key === 'ArrowRight' &&
      event.currentTarget instanceof HTMLInputElement &&
      event.currentTarget.selectionStart === event.currentTarget.value.length &&
      event.currentTarget.selectionEnd === event.currentTarget.value.length
    ) {
      handleApply()
    }
  }

  const preview = useMemo(() => {
    try {
      return katex.renderToString(content || ' ', {
        throwOnError: false,
        strict: false,
        globalGroup: true
      })
    } catch (error) {
      return `Error: ${(error as Error).message}`
    }
  }, [content])

  return (
    <NodeViewWrapper className="math-component-wrapper" as="span">
      <div className="relative inline-block">
        <span
          dangerouslySetInnerHTML={{ __html: preview }}
          contentEditable={false}
          className={`rounded-xs inline-block border px-1 ${
            props.selected
              ? 'border-blue-600 bg-blue-100'
              : 'border-transparent bg-transparent'
          }`}
        />
        {isEditing && (
          <div className="absolute left-0 top-full z-10 mt-1 flex items-center rounded-md border border-gray-300 bg-white p-1 shadow-lg">
            <input
              ref={inputRef}
              type="text"
              value={content}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder={t('latex_placeholder')}
              className="w-60 rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
            <button
              onClick={handleApply}
              className="ml-2 cursor-pointer rounded-md border-none bg-blue-600 px-2 py-1 text-sm text-white"
            >
              {t('apply_button')}
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
