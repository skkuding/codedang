'use client'

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
import { DialogClose } from '@radix-ui/react-dialog'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Button } from './ui/button'

export default function TextEditor({ placeholder }: { placeholder: string }) {
  const [url, setUrl] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
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
    }
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

        <Dialog>
          <DialogTrigger asChild>
            <Toggle size="sm" pressed={editor.isActive('link')}>
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
      </div>
      <EditorContent className="prose" editor={editor} />
    </div>
  )
}
