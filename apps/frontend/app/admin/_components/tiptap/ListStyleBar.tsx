import { Toggle } from '@/components/shadcn/toggle'
import BulletList from '@/public/icons/texteditor-bulletlist.svg'
import NumberedList from '@/public/icons/texteditor-numberedlist.svg'
import { getTranslate } from '@/tolgee/server'
import type { Editor } from '@tiptap/core'
import Image from 'next/image'

interface ListStyleBarProps {
  editor: Editor
}

export async function ListStyleBar({ editor }: ListStyleBarProps) {
  const t = await getTranslate()
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
        <Image
          src={BulletList}
          alt={t('bullet_list_alt')}
          className="h-5 w-5"
        />
      </Toggle>
      <Toggle
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => {
          editor.chain().focus().toggleOrderedList().run()
          editor.commands.focus()
        }}
        className="h-9 w-9 p-1"
      >
        <Image
          src={NumberedList}
          alt={t('numbered_list_alt')}
          className="h-5 w-5"
        />
      </Toggle>
    </div>
  )
}
