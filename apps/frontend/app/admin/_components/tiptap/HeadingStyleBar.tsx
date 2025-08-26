import { Toggle } from '@/components/shadcn/toggle'
import Heading1 from '@/public/icons/texteditor-h1.svg'
import Heading2 from '@/public/icons/texteditor-h2.svg'
import Heading3 from '@/public/icons/texteditor-h3.svg'
import type { Editor } from '@tiptap/core'
import Image from 'next/image'

interface HeadingSizeBarProps {
  editor: Editor
}

export function HeadingStyleBar({ editor }: HeadingSizeBarProps) {
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
        <Image src={Heading1} alt="Heading 1" className="h-[18px] w-[18px]" />
      </Toggle>
      <Toggle
        pressed={editor.isActive('heading', { level: 2 })}
        onPressedChange={() => {
          editor.commands.toggleHeading({ level: 2 })
          editor.commands.focus()
        }}
        className="h-9 w-9 p-1"
      >
        <Image src={Heading2} alt="Heading 2" className="h-[18px] w-[18px]" />
      </Toggle>
      <Toggle
        pressed={editor.isActive('heading', { level: 3 })}
        onPressedChange={() => {
          editor.commands.toggleHeading({ level: 3 })
          editor.commands.focus()
        }}
        className="h-9 w-9 p-1"
      >
        <Image src={Heading3} alt="Heading 3" className="h-[18px] w-[18px]" />
      </Toggle>
    </div>
  )
}
