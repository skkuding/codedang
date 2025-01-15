'use client'

import { CautionDialog } from '@/app/admin/problem/_components/CautionDialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import { Toggle } from '@/components/shadcn/toggle'
import { UPLOAD_IMAGE } from '@/graphql/problem/mutations'
import { useMutation } from '@apollo/client'
import Tex from '@matejmazur/react-katex'
import { DialogClose } from '@radix-ui/react-dialog'
import { mergeAttributes, Node } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension } from '@tiptap/react'
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
  Pi,
  ImagePlus
} from 'lucide-react'
import { useCallback, useState } from 'react'
import InsertDialog from './InsertDialog'
import { Button } from './shadcn/button'

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

export const Indentation = Extension.create({
  name: 'indentation',
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const { state, dispatch } = editor.view
        const { selection } = state
        const transaction = state.tr.insertText(
          '  ',
          selection.from,
          selection.to
        ) // Insert two spaces
        dispatch(transaction)
        return true
      }
    }
  }
})

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
  const [imageUrl, setImageUrl] = useState<string | undefined>('')
  const [equation, setEquation] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogDescription, setDialogDescription] = useState<string>('')

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
        placeholder: ({ editor }) =>
          editor.getHTML() === '<p></p>' ? placeholder : '',
        emptyEditorClass:
          'before:absolute before:text-gray-300 before:float-left before:content-[attr(data-placeholder)] before:pointer-events-none'
      }),
      Link,
      Indentation,
      Image.configure({ inline: true, allowBase64: true })
    ],
    editorProps: {
      attributes: {
        class:
          'rounded-b-md border overflow-y-auto w-full h-[200px] border-input bg-backround px-3 ring-offset-2 disabled:cursur-not-allowed disabled:opacity-50 resize-y'
      }
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    content: defaultValue
  })

  const setLink = useCallback(
    (linkUrl: string | null) => {
      console.log(linkUrl)
      if (!editor) return null
      // cancelled
      if (linkUrl === null) {
        return
      }
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

  const addImage = useCallback(
    (imageUrl: string | undefined) => {
      console.log(imageUrl)
      if (!editor) return null
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

  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const handleUploadPhoto = async (files: FileList | null) => {
    if (files === null) return
    const file = files[0]
    try {
      const { data } = await uploadImage({
        variables: {
          input: { file }
        }
      })
      console.log('data', data)
      setImageUrl(data?.uploadImage.src ?? '')
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message
        if (errorMessage === 'File size exceeds maximum limit') {
          setDialogDescription('Images larger than 5MB cannot be uploaded.')
          setIsDialogOpen(true)
        }
      }
    }
  }

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

        <InsertDialog
          editor={editor}
          activeType="link"
          title="Insert Link"
          description={
            <Input
              placeholder="Enter URL"
              onChange={(e) => setUrl(e.target.value)}
            />
          }
          triggerIcon={<LinkIcon className="h-[14px] w-[14px]" />}
          onInsert={() => setLink(url)}
        />

        <InsertDialog
          editor={editor}
          activeType="katex"
          title="Insert Equation"
          description={
            <Input placeholder="Enter Equation" onChange={handleEquation} />
          }
          triggerIcon={<Pi className="h-[14px] w-[14px]" />}
          onInsert={() => {
            editor
              ?.chain()
              .focus()
              .insertContent(
                `<math-component content="${equation}"></math-component>`
              )
              .run()
          }}
        />

        <InsertDialog
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
          triggerIcon={<ImagePlus className="h-[14px] w-[14px]" />}
          onInsert={() => addImage(imageUrl)}
          onToggleClick={() => setImageUrl('')}
        />
      </div>
      <CautionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        description={dialogDescription}
      />
      <EditorContent className="prose max-w-5xl" editor={editor} />
    </div>
  )
}
