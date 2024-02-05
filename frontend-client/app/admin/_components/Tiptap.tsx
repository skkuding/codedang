'use client'

import { Toggle } from '@/components/ui/toggle'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react'
import { useCallback } from 'react'

export default function Tiptap({
  placeholder
  // onChange,
}: {
  placeholder: string
  // onChange: (richText: string) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
        emptyEditorClass:
          'before:absolute before:text-gray-300 before:float-left before:content-[attr(data-placeholder)] before:pointer-events-none'
      }),
      Link.configure()
    ],
    editorProps: {
      attributes: {
        class:
          'rounded-b-md border overflow-y-auto w-full h-[200px] border-input bg-backround px-3 ring-offset-2 disabled:cursur-not-allowed disabled:opacity-50'
      }
    },
    onUpdate({ editor }) {
      // onChange(editor.getHTML())
      console.log(editor.getHTML())
    }
  })

  const setLink = useCallback(() => {
    if (!editor) return null
    const previousUrl = editor.getAttributes('link')?.href
    const url = window.prompt('URL', previousUrl)
    // cancelled
    if (url === null) {
      return
    }
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    // update link
    console.log(url)
    // console.log('previous: ' + previousUrl)
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url, target: '_blank' })
      .run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="flex flex-col justify-stretch">
      <div className="flex gap-1 rounded-t-md border border-b-0 p-1">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-[14px] w-[14px]" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-[14px] w-[14px]" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-[14px] w-[14px]" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="h-[14px] w-[14px]" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('link')}
          onPressedChange={setLink}
        >
          <LinkIcon className="h-[14px] w-[14px]" />
        </Toggle>
      </div>
      <EditorContent className="prose" editor={editor} />
    </div>
  )
}
