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
import { UPLOAD_IMAGE, UPLOAD_FILE } from '@/graphql/problem/mutations'
import { cn } from '@/libs/utils'
import BulletList from '@/public/icons/texteditor-bulletlist.svg'
import CodeBlock from '@/public/icons/texteditor-codeblock.svg'
import SquareRadical from '@/public/icons/texteditor-equation.svg'
import Expand from '@/public/icons/texteditor-expand.svg'
import Paperclip from '@/public/icons/texteditor-file.svg'
import Heading1 from '@/public/icons/texteditor-h1.svg'
import Heading2 from '@/public/icons/texteditor-h2.svg'
import Heading3 from '@/public/icons/texteditor-h3.svg'
import ImagePlus from '@/public/icons/texteditor-image.svg'
import NumberedList from '@/public/icons/texteditor-numberedlist.svg'
import Redo from '@/public/icons/texteditor-redo.svg'
import Shrink from '@/public/icons/texteditor-shrink.svg'
import TableIcon from '@/public/icons/texteditor-table.svg'
import Undo from '@/public/icons/texteditor-undo.svg'
import { useMutation } from '@apollo/client'
import type { Range } from '@tiptap/core'
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
import type { Editor, NodeViewWrapperProps } from '@tiptap/react'
import { Extension } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import 'highlight.js/styles/github-dark.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { common, createLowlight } from 'lowlight'
import {
  Trash,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRightToLine,
  ArrowLeftFromLine
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CautionDialog } from './CautionDialog'
import { CodeBlockComponent } from './tiptap/CodeBlockComponent'
import { FileDownloadNode } from './tiptap/FileDownloadNode'
import { TextStyleBar } from './tiptap/TextStyleBar'
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
  const lowlight = createLowlight(common)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: false
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
              () => setIsFileDialogOpen(true),
              () => setIsTableDialogOpen(true)
            )
          }
        }
      })
    ],
    editorProps: {
      attributes: {
        class: `focus:outline-none overflow-y-auto w-full px-3 disabled:cursur-not-allowed disabled:opacity-50 resize-y ${
          isExpanded ? 'h-[500px]' : 'h-[300px]'
        }`
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    immediatelyRender: false,
    content: defaultValue
  })

  const [uploadImage] = useMutation(UPLOAD_IMAGE)
  const [uploadFile] = useMutation(UPLOAD_FILE)

  const [imageUrl, setImageUrl] = useState<string | undefined>('')
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [fileUrl, setFileUrl] = useState<string | undefined>('')
  const [fileName, setFileName] = useState<string | undefined>('')
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false)
  const [tableSize, setTableSize] = useState({ rowCount: 0, columnCount: 0 })
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false)
  const [isTablePopoverOpen, setIsTablePopoverOpen] = useState(false)
  const [isCautionDialogOpen, setIsCautionDialogOpen] = useState(false)
  const [dialogDescription, setDialogDescription] = useState<string>('')
  const [isExpandedScreenOpen, setIsExpandedScreenOpen] = useState(false)

  const addImage = useCallback(
    (imageUrl?: string) => {
      if (!editor || !imageUrl) {
        return
      }
      editor.chain().focus().setImage({ src: imageUrl }).run()
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

  const addFile = useCallback(
    (fileUrl?: string, fileName?: string) => {
      if (!editor || !fileUrl) {
        return
      }
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'fileDownload',
          attrs: { href: fileUrl, fileName: fileName ?? 'File' }
        })
        .run()
    },
    [editor]
  )

  const handleUploadFile = async (files: FileList | null) => {
    if (files === null) {
      return
    }
    const file = files[0]
    try {
      const { data } = await uploadFile({
        variables: {
          input: { file }
        }
      })
      console.log(data?.uploadFile.src)
      setFileUrl(data?.uploadFile.src ?? '')
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message
        if (errorMessage === 'File size exceeds maximum limit') {
          setDialogDescription('Files larger than 30MB cannot be uploaded.')
          setIsCautionDialogOpen(true)
        }
      }
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border">
      {editor && (
        <div className="flex flex-wrap items-center gap-1 border-b bg-white p-1">
          <TextStyleBar editor={editor} />
          <div className="mx-1 h-8 shrink-0 border-r" />
          <Toggle
            pressed={editor.isActive('heading', { level: 1 })}
            onPressedChange={() => {
              editor.commands.toggleHeading({ level: 1 })
              editor.commands.focus()
            }}
            className="h-9 w-9 p-1"
          >
            <Image
              src={Heading1}
              alt="Heading 1"
              className="h-[18px] w-[18px]"
            />
          </Toggle>
          <Toggle
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => {
              editor.commands.toggleHeading({ level: 2 })
              editor.commands.focus()
            }}
            className="h-9 w-9 p-1"
          >
            <Image
              src={Heading2}
              alt="Heading 2"
              className="h-[18px] w-[18px]"
            />
          </Toggle>
          <Toggle
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() => {
              editor.commands.toggleHeading({ level: 3 })
              editor.commands.focus()
            }}
            className="h-9 w-9 p-1"
          >
            <Image
              src={Heading3}
              alt="Heading 3"
              className="h-[18px] w-[18px]"
            />
          </Toggle>
          <div className="mx-1 h-8 shrink-0 border-r" />
          <Toggle
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => {
              editor.chain().focus().toggleBulletList().run()
              editor.commands.focus()
            }}
            className="h-9 w-9 p-1"
          >
            <Image src={BulletList} alt="Bullet List" className="h-5 w-5" />
          </Toggle>
          <Toggle
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => {
              editor.chain().focus().toggleOrderedList().run()
              editor.commands.focus()
            }}
            className="h-9 w-9 p-1"
          >
            <Image src={NumberedList} alt="Numbered List" className="h-5 w-5" />
          </Toggle>
          <div className="mx-1 h-8 shrink-0 border-r" />
          <InsertDialog
            open={isFileDialogOpen}
            editor={editor}
            activeType="file"
            title="Upload File"
            description={
              <>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    handleUploadFile(e.target.files)
                    setFileName(e.target.files?.[0].name ?? '')
                  }}
                />
                <p className="text-sm"> * File must be under 30MB</p>
              </>
            }
            triggerIcon={
              <Image src={Paperclip} alt="File" className="h-[18px] w-[18px]" />
            }
            onOpenChange={(open) => {
              setIsFileDialogOpen(open)
              if (!open) {
                setTimeout(() => {
                  editor.commands.focus()
                }, 200)
              }
            }}
            onInsert={() => addFile(fileUrl, fileName)}
            onToggleClick={() => setIsFileDialogOpen(true)}
          />
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
            triggerIcon={
              <Image
                src={ImagePlus}
                alt="Image"
                className="h-[18px] w-[18px]"
              />
            }
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
            type="button"
            onClick={() => {
              editor
                .chain()
                .focus()
                .insertContent(`<math-component content=""></math-component>`)
                .blur()
                .run()
            }}
            className="h-9 w-9 p-1 text-black"
          >
            <Image
              src={SquareRadical}
              alt="Equation"
              className="h-[17px] w-[17px]"
            />
          </Toggle>
          <Toggle
            type="button"
            onClick={() => {
              editor.chain().focus().setCodeBlock().run()
              editor.commands.focus()
            }}
            className="h-9 w-9 p-1 text-black"
          >
            <Image src={CodeBlock} alt="Code Block" className="h-[18px] w-5" />
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
                className="h-9 w-9 p-1"
                onPressedChange={() => {
                  if (!editor.isActive('table')) {
                    setIsTableDialogOpen(true)
                  } else {
                    setIsTablePopoverOpen(true)
                  }
                }}
              >
                <Image src={TableIcon} alt="Table" className="h-5 w-5" />
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
          <div className="mx-1 h-6 shrink-0 border-r" />
          <Button
            variant="ghost"
            type="button"
            className="h-9 w-9 p-1"
            disabled={!editor.can().undo()}
            onClick={() => {
              editor.commands.undo()
            }}
          >
            <Image src={Undo} alt="Undo" className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            type="button"
            className="h-9 w-9 p-1"
            disabled={!editor.can().redo()}
            onClick={() => {
              editor.commands.redo()
            }}
          >
            <Image src={Redo} alt="Redo" className="h-4 w-4" />
          </Button>
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
      <CautionDialog
        isOpen={isCautionDialogOpen}
        onClose={() => setIsCautionDialogOpen(false)}
        description={dialogDescription}
      />
      <EditorContent
        editor={editor}
        className={cn(
          'prose max-w-5xl overflow-hidden bg-white',
          isDarkMode && 'prose-invert bg-transparent'
        )}
      />
      {!isExpanded && (
        <Dialog open={isExpandedScreenOpen}>
          <DialogContent
            className="max-w-5xl !border-none !bg-transparent !p-0"
            hideCloseButton={true}
          >
            <TextEditor
              placeholder={placeholder}
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
