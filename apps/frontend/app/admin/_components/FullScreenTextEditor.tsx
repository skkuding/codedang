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
  DialogTitle,
  DialogTrigger
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
import Tex from '@matejmazur/react-katex'
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
import {
  useEditor,
  EditorContent,
  BubbleMenu,
  mergeAttributes,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  Node
} from '@tiptap/react'
import type { Editor, Extension, NodeViewWrapperProps } from '@tiptap/react'
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
  Shrink
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { CautionDialog } from '../problem/_components/CautionDialog'
import { TextStyleBar } from './tiptap/TextStyleBar'
import { Commands, type CommandProps } from './tiptap/commands'
import { getSuggestionItems } from './tiptap/items'
import { renderItems } from './tiptap/renderItems'
import './tiptap/styles.css'

export function FullScreenTextEditor({
  placeholder,
  onClose,
  defaultValue
}: {
  placeholder: string
  onClose: (richText: string) => void
  defaultValue?: string
}) {
  const lowlight = createLowlight(common)

  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight
      }),
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
              () => setIsKatexDialogOpen(true),
              () => setIsTableDialogOpen(true)
            )
          }
        }
      })
    ],
    editorProps: {
      attributes: {
        class:
          'rounded-b-md border overflow-y-auto w-full h-[1000px] border-input bg-backround px-3 ring-offset-2 disabled:cursur-not-allowed disabled:opacity-50 resize-y'
      }
    },
    content: defaultValue
  })

  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const [imageUrl, setImageUrl] = useState<string | undefined>('')
  const [equation, setEquation] = useState('')
  const [isKatexDialogOpen, setIsKatexDialogOpen] = useState(false)
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

  const handleEquation = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEquation(event.target.value)
    },
    [setEquation]
  )

  return (
    <div className="flex w-full flex-col gap-1">
      {editor && (
        <>
          <BubbleMenu
            className="bubble-menu rounded-lg border bg-white"
            tippyOptions={{ duration: 100 }}
            editor={editor}
          >
            <TextStyleBar editor={editor} />
          </BubbleMenu>
          <div className="flex items-center border bg-white p-1">
            <TextStyleBar editor={editor} />
            <div className="mx-1 h-full flex-shrink-0 bg-black" />
            <Toggle
              pressed={editor.isActive('heading', { level: 1 })}
              onPressedChange={() => {
                editor.commands.toggleHeading({ level: 1 })
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1"
            >
              <Heading1 />
            </Toggle>
            <Toggle
              pressed={editor.isActive('heading', { level: 2 })}
              onPressedChange={() => {
                editor.commands.toggleHeading({ level: 2 })
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1"
            >
              <Heading2 />
            </Toggle>
            <Toggle
              pressed={editor.isActive('heading', { level: 3 })}
              onPressedChange={() => {
                editor.commands.toggleHeading({ level: 3 })
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1"
            >
              <Heading3 />
            </Toggle>
            <InsertDialog
              open={isKatexDialogOpen}
              editor={editor}
              activeType="katex"
              title="Insert Equation"
              description={
                <>
                  <Input
                    placeholder="Enter Equation"
                    onChange={handleEquation}
                  />
                  <Tex block className="text-black">
                    {equation}
                  </Tex>
                </>
              }
              triggerIcon={<SquareRadical />}
              onOpenChange={(open) => {
                setIsKatexDialogOpen(open)
                if (!open) {
                  setTimeout(() => {
                    editor.commands.focus()
                  }, 200)
                }
              }}
              onInsert={() => {
                editor
                  .chain()
                  .focus()
                  .insertContent(
                    `<math-component content="${equation}"></math-component>`
                  )
                  .run()
                setEquation('')
              }}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                editor.chain().focus().setCodeBlock().run()
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1 text-black"
            >
              <FileCode2 />
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
              triggerIcon={<ImagePlus />}
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
              <List />
            </Toggle>
            <Toggle
              pressed={editor.isActive('orderedList')}
              onPressedChange={() => {
                editor.chain().focus().toggleOrderedList().run()
                editor.commands.focus()
              }}
              className="h-7 w-7 p-1"
            >
              <ListOrdered />
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
                  <Grid3X3 />
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
                  <ArrowDownToLine />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => editor.commands.deleteRow()}
                  className="h-7 w-7 p-1"
                >
                  <ArrowUpFromLine />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    editor.commands.selectParentNode()
                    editor.commands.addColumnAfter()
                  }}
                  className="h-7 w-7 p-1"
                >
                  <ArrowRightToLine />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => editor.commands.deleteColumn()}
                  className="h-7 w-7 p-1"
                >
                  <ArrowLeftFromLine />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    editor.commands.deleteTable()
                    setIsTablePopoverOpen(false)
                  }}
                  className="h-7 w-7 p-1"
                >
                  <Trash />
                </Button>
              </PopoverContent>
            </Popover>
            <div className="ml-auto flex space-x-2">
              <Button
                variant="ghost"
                type="button"
                className="h-7 w-7 p-1"
                onClick={() => onClose(editor.getHTML())}
              >
                <Shrink />
              </Button>
            </div>
          </div>
        </>
      )}
      <CautionDialog
        isOpen={isCautionDialogOpen}
        onClose={() => setIsCautionDialogOpen(false)}
        description={dialogDescription}
      />
      <EditorContent editor={editor} className="prose w-full max-w-full" />
    </div>
  )
}

export const MathExtension = Node.create({
  name: 'mathComponent',
  group: 'inline math',
  content: 'text*',
  inline: true,
  defining: true,
  draggable: true,
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
    return ReactNodeViewRenderer(MathPreview) // Update the type to NodeViewRenderer
  },
  addKeyboardShortcuts() {
    return {}
  }
})

function MathPreview(props: NodeViewWrapperProps) {
  const [content, setContent] = useState(props.node.attrs.content)
  const [isOpen, setIsOpen] = useState(true)
  const handleContentChange = (event: { target: { value: unknown } }) => {
    setContent(event.target.value)
  }
  const preview = katex.renderToString(content, {
    throwOnError: false,
    strict: false,
    globalGroup: true
  })

  return (
    <NodeViewWrapper className="math-block-preview cursor-pointer" as="span">
      {isOpen && (
        <Dialog aria-label="Edit Math Equation">
          <DialogTrigger asChild>
            <span
              dangerouslySetInnerHTML={{ __html: preview }}
              contentEditable={false}
              onClick={() => {
                setIsOpen(true)
              }}
            />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Equation</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Input
                value={content}
                placeholder="Enter Equation"
                onChange={handleContentChange}
              />
              <Tex block className="text-black">
                {content}
              </Tex>
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Insert</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </NodeViewWrapper>
  )
}
