import { Toggle } from '@/components/shadcn/toggle'
import BulletList from '@/public/icons/texteditor-bulletlist.svg'
import NumberedList from '@/public/icons/texteditor-numberedlist.svg'
import type { Editor } from '@tiptap/core'
import Image from 'next/image'

interface ListStyleBarProps {
  editor: Editor
}

export function ListStyleBar({ editor }: ListStyleBarProps) {
  return (
    <div className="flex items-center">
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
    </div>
  )
}
