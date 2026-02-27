import { Toggle } from '@/components/shadcn/toggle'
import Heading1 from '@/public/icons/texteditor-h1.svg'
import Heading2 from '@/public/icons/texteditor-h2.svg'
import Heading3 from '@/public/icons/texteditor-h3.svg'
import { getTranslate } from '@/tolgee/server'
import type { Editor } from '@tiptap/core'
import Image from 'next/image'

interface HeadingSizeBarProps {
  editor: Editor
}

export async function HeadingStyleBar({ editor }: HeadingSizeBarProps) {
  const t = await getTranslate()
  return (
    <div className="flex items-center">
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
          alt={t('heading_1_alt')}
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
          alt={t('heading_2_alt')}
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
          alt={t('heading_3_alt')}
          className="h-[18px] w-[18px]"
        />
      </Toggle>
    </div>
  )
}
