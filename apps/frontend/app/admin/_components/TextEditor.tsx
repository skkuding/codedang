'use client'

import { InsertDialog } from '@/components/InsertDialog'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { Toggle } from '@/components/shadcn/toggle'
import { UPLOAD_IMAGE } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import type { Range } from '@tiptap/core'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Heading from '@tiptap/extension-heading'
import Image from '@tiptap/extension-image'
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
  BubbleMenu,
  mergeAttributes,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  Node
} from '@tiptap/react'
import type { Editor, NodeViewWrapperProps } from '@tiptap/react'
import { Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import 'highlight.js/styles/github-dark.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { common, createLowlight } from 'lowlight'
import {
  ImagePlus,
  SquareRadical,
  FileCode2,
  Heading1,
  Heading2,
  Heading3,
  Grid3X3,
  List,
  ListOrdered,
  Trash,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightToLine,
  ArrowLeftFromLine,
  Expand,
  Redo,
  Undo
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CautionDialog } from '../problem/_components/CautionDialog'
import { FullScreenTextEditor } from './FullScreenTextEditor'
import { CodeBlockComponent } from './tiptap/CodeBlockComponent'
import { TextStyleBar } from './tiptap/TextStyleBar'
import { Commands, type CommandProps } from './tiptap/commands'
import { getSuggestionItems } from './tiptap/items'
import { renderItems } from './tiptap/renderItems'
import './tiptap/styles.css'

export function TextEditor({
  placeholder,
  onChange,
  defaultValue
}: {
  placeholder: string
  onChange: (richText: string) => void
  defaultValue?: string
}) {
  const lowlight = createLowlight(common)

  const editor = useEditor({
    extensions: [
      StarterKit,
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
      Image,
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
          items: ({
            query
          }: {
            query?: string
          }): {
            title: string
            command: ({
              editor,
              range
            }: {
              editor: Editor
              range: Range
            }) => void
          }[] => {
            return getSuggestionItems(
              query,
              () => setIsImageDialogOpen(true),
              () => setIsTableDialogOpen(true)
            )
          }
        }
      })
    ],
    editorProps: {
      attributes: {
        class:
          'rounded-b-md border overflow-y-auto w-full h-[300px] border-input bg-backround px-3 ring-offset-2 disabled:cursur-not-allowed disabled:opacity-50 resize-y'
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    content: defaultValue
  })

  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const [imageUrl, setImageUrl] = useState<string | undefined>('')
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [tableSize, setTableSize] = useState({ rowCount: 0, columnCount: 0 })
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false)
  const [isCautionDialogOpen, setIsCautionDialogOpen] = useState(false)
  const [dialogDescription, setDialogDescription] = useState<string>('')

  const addImage = useCallback(
    (imageUrl: string | undefined) => {
      if (!editor) {
        return null
      }
      if (imageUrl === null) {
        return
      }
      if (imageUrl === '') {
        return
      }
      if (imageUrl) {
        editor?.chain().focus().setImage({ src: imageUrl }).run()
      }
    },
    [editor]
  )

  const handleUploadPhoto = async (files: FileList | null) => {
    if (files === null) {
      return
    }
    const file = files[0]
    try {
      const { data } = await uploadImage({
        variables: {
          input: { file }
        }
      })
      setImageUrl(data?.uploadImage.src ?? '')
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message
        if (errorMessage === 'File size exceeds maximum limit') {
          setDialogDescription('Images larger than 5MB cannot be uploaded.')
          setIsCautionDialogOpen(true)
        }
      }
    }
  }

  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false)
  const FullScreenEditor = () =>
    createPortal(
      <div className="fixed inset-0 z-50 flex bg-white">
        <FullScreenTextEditor
          placeholder=""
          onClose={(content) => {
            editor?.commands.setContent(content)
            setIsFullScreenOpen(false)
          }}
          defaultValue={editor?.getHTML()}
        />
      </div>,
      document.body
    )

  return (
    <div className="flex flex-col gap-1">
      {editor && (
        <>
          <BubbleMenu
            className="bubble-menu rounded-lg border bg-white"
            tippyOptions={{ duration: 100 }}
            editor={editor}
          >
            <TextStyleBar editor={editor} />
          </BubbleMenu>
          <div className="flex flex-wrap items-center border bg-white p-1">
            <TextStyleBar editor={editor} />
            <div className="mx-1 h-6 flex-shrink-0 border-r" />
            <Toggle
              pressed={editor.isActive('heading', { level: 1 })}
              onPressedChange={() => {
                editor.commands.toggleHeading({ level: 1 })
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1"
            >
              <Heading1 className="text-neutral-600" />
            </Toggle>
            <Toggle
              pressed={editor.isActive('heading', { level: 2 })}
              onPressedChange={() => {
                editor.commands.toggleHeading({ level: 2 })
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1"
            >
              <Heading2 className="text-neutral-600" />
            </Toggle>
            <Toggle
              pressed={editor.isActive('heading', { level: 3 })}
              onPressedChange={() => {
                editor.commands.toggleHeading({ level: 3 })
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1"
            >
              <Heading3 className="text-neutral-600" />
            </Toggle>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .insertContent(`<math-component content=""></math-component>`)
                  .blur()
                  .run()
              }}
              className="h-7 w-7 p-1 text-black"
            >
              <SquareRadical className="text-neutral-600" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                editor.chain().focus().setCodeBlock().run()
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1 text-black"
            >
              <FileCode2 className="text-neutral-600" />
            </Button>
            <InsertDialog
              open={isImageDialogOpen}
              editor={editor}
              activeType="image"
              title="Upload Image"
              description={
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleUploadPhoto(e.target.files)
                    }}
                  />
                  <p className="text-sm"> * Image must be under 5MB</p>
                </>
              }
              triggerIcon={<ImagePlus className="text-neutral-600" />}
              onOpenChange={(open) => {
                setIsImageDialogOpen(open)
                if (!open) {
                  setTimeout(() => {
                    editor.commands.focus()
                  }, 200)
                }
              }}
              onInsert={() => addImage(imageUrl)}
              onToggleClick={() => setIsImageDialogOpen(true)}
            />
            <Toggle
              pressed={editor.isActive('bulletList')}
              onPressedChange={() => {
                editor.chain().focus().toggleBulletList().run()
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1"
            >
              <List className="text-neutral-600" />
            </Toggle>
            <Toggle
              pressed={editor.isActive('orderedList')}
              onPressedChange={() => {
                editor.chain().focus().toggleOrderedList().run()
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1"
            >
              <ListOrdered className="text-neutral-600" />
            </Toggle>
            <Dialog
              open={isTableDialogOpen}
              onOpenChange={(open) => {
                setIsTableDialogOpen(open)
                if (!open) {
                  setTimeout(() => {
                    editor.commands.focus()
                  }, 200)
                }
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Table</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <div className="my-4 flex w-32 items-center justify-between">
                    <p>Row: </p>
                    <Input
                      type="number"
                      className="h-8 w-16"
                      placeholder="Enter row"
                      value={tableSize.rowCount}
                      onChange={(e) =>
                        setTableSize({
                          rowCount: Number(e.target.value),
                          columnCount: tableSize.columnCount
                        })
                      }
                    />
                  </div>
                  <div className="flex w-32 items-center justify-between">
                    <p>Column: </p>
                    <Input
                      type="number"
                      className="h-8 w-16"
                      placeholder="Enter column"
                      value={tableSize.columnCount}
                      onChange={(e) =>
                        setTableSize({
                          rowCount: tableSize.rowCount,
                          columnCount: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                </DialogDescription>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button
                      onClick={() => {
                        editor.commands.insertTable({
                          rows: tableSize.rowCount,
                          cols: tableSize.columnCount
                        })
                      }}
                    >
                      Insert
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Popover
              open={isTablePopoverOpen}
              onOpenChange={setIsTablePopoverOpen}
            >
              <PopoverTrigger className="flex items-center">
                <Toggle
                  pressed={editor.isActive('table')}
                  className="h-7 w-7 p-1"
                  onPressedChange={() => {
                    if (!editor.isActive('table')) {
                      setIsTableDialogOpen(true)
                    } else {
                      setIsTablePopoverOpen(true)
                    }
                  }}
                >
                  <Grid3X3 className="text-neutral-600" />
                </Toggle>
              </PopoverTrigger>
              <PopoverContent className="flex gap-2 rounded-lg border bg-white p-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    editor.commands.selectParentNode()
                    editor.commands.addRowAfter()
                  }}
                  className="h-7 w-7 p-1"
                >
                  <ArrowDownToLine className="text-neutral-600" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => editor.commands.deleteRow()}
                  className="h-7 w-7 p-1"
                >
                  <ArrowUpFromLine className="text-neutral-600" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    editor.commands.selectParentNode()
                    editor.commands.addColumnAfter()
                  }}
                  className="h-7 w-7 p-1"
                >
                  <ArrowRightToLine className="text-neutral-600" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => editor.commands.deleteColumn()}
                  className="h-7 w-7 p-1"
                >
                  <ArrowLeftFromLine className="text-neutral-600" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    editor.commands.deleteTable()
                    setIsTablePopoverOpen(false)
                  }}
                  className="h-7 w-7 p-1"
                >
                  <Trash className="text-neutral-600" />
                </Button>
              </PopoverContent>
            </Popover>
            <div className="mx-1 h-6 flex-shrink-0 border-r" />
            <Button
              variant="ghost"
              type="button"
              className="h-7 w-7 p-1"
              disabled={!editor.can().undo()}
              onClick={() => {
                editor.commands.undo()
              }}
            >
              <Undo className="text-neutral-600" />
            </Button>
            <Button
              variant="ghost"
              type="button"
              className="h-7 w-7 p-1"
              disabled={!editor.can().redo()}
              onClick={() => {
                editor.commands.redo()
              }}
            >
              <Redo className="text-neutral-600" />
            </Button>
            <div className="ml-auto flex space-x-2">
              <Button
                variant="ghost"
                type="button"
                className="h-7 w-7 p-1"
                onClick={() => {
                  setIsFullScreenOpen(!isFullScreenOpen)
                }}
              >
                <Expand className="text-neutral-600" />
              </Button>
            </div>
            {isFullScreenOpen && <FullScreenEditor />}
          </div>
        </>
      )}
      <CautionDialog
        isOpen={isCautionDialogOpen}
        onClose={() => setIsCautionDialogOpen(false)}
        description={dialogDescription}
      />
      <EditorContent editor={editor} className="prose max-w-5xl" />
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
          className={`inline-block rounded-sm border px-1 ${
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
              placeholder="Please Insert LaTeX"
              className="w-60 rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
            <button
              onClick={handleApply}
              className="ml-2 cursor-pointer rounded-md border-none bg-blue-600 px-2 py-1 text-sm text-white"
            >
              Apply
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  )
}
