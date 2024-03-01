import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import Tex from '@matejmazur/react-katex'
import { DialogClose } from '@radix-ui/react-dialog'
import { mergeAttributes, Node } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import type { Extension } from '@tiptap/react'
import { useEditor, EditorContent } from '@tiptap/react'
import { ReactNodeViewRenderer } from '@tiptap/react'
import type { NodeViewWrapperProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Pi
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from './ui/button'

function MathPreview(props: NodeViewWrapperProps) {
  const [content, setContent] = useState(props.node.attrs.content)
  const [isOpen, setIsOpen] = useState(true)
  const handleContentChange = (event) => {
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

export default function TextEditor({
  placeholder,
  onChange,
  defaultValue
}: {
  placeholder: string
  onChange: (richText: string) => void
  defaultValue?: string
}) {
  const [url, setUrl] = useState('')
  const [equation, setEquation] = useState('')
  const handleEquation = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setEquation(event.target.value)
    },
    [setEquation]
  )

  const editor = useEditor({
    extensions: [
      StarterKit,
      MathExtension as Extension,
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:absolute before:text-gray-300 before:float-left before:content-[attr(data-placeholder)] before:pointer-events-none'
      }),
      Link
    ],
    editorProps: {
      attributes: {
        class:
          'rounded-b-md border overflow-y-auto w-full h-[200px] border-input bg-backround px-3 ring-offset-2 disabled:cursur-not-allowed disabled:opacity-50'
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    content: defaultValue
  })

  const setLink = useCallback(
    (linkUrl: string | null) => {
      if (!editor) return null

      // cancelled
      if (linkUrl === null) {
        return
      }
      console.log('실행됨')
      console.log('url: ' + linkUrl)
      // empty
      if (linkUrl === '') {
        editor.chain().focus().extendMarkRange('link').unsetLink().run()
        return
      }
      // update link
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl, target: '_blank' })
        .run()
    },
    [editor]
  )

  return (
    <div className="flex flex-col justify-stretch bg-white">
      <div className="flex gap-1 rounded-t-md border border-b-0 p-1">
        <Toggle
          size="sm"
          pressed={editor?.isActive('bold')}
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="h-[14px] w-[14px]" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive('italic')}
          onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-[14px] w-[14px]" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive('bulletList')}
          onPressedChange={() =>
            editor?.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-[14px] w-[14px]" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor?.isActive('orderedList')}
          onPressedChange={() =>
            editor?.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="h-[14px] w-[14px]" />
        </Toggle>

        <Dialog>
          <DialogTrigger asChild>
            <Toggle size="sm" pressed={editor?.isActive('link')}>
              <LinkIcon className="h-[14px] w-[14px]" />
            </Toggle>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert URL</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Input
                placeholder="Enter URL"
                onChange={(e) => {
                  setUrl(e.target.value)
                }}
              />
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    setLink(url)
                  }}
                >
                  Insert
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor?.isActive('katex')}
              onPressedChange={() => {
                setEquation('')
              }}
            >
              <Pi className="h-[14px] w-[14px]" />
            </Toggle>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Insert Equation</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <Input placeholder="Enter Equation" onChange={handleEquation} />
              <Tex block className="text-black">
                {equation}
              </Tex>
            </DialogDescription>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    editor
                      ?.chain()
                      .focus()
                      .insertContent(
                        `<math-component content="${equation}"></math-component>`
                      )
                      .run()
                  }}
                >
                  Insert
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <EditorContent className="prose max-w-5xl" editor={editor} />
    </div>
  )
}
