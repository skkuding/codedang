import { Toggle } from '@/components/shadcn/toggle'
import BoldIcon from '@/public/icons/texteditor-bold.svg'
import CodeIcon from '@/public/icons/texteditor-code.svg'
import ItalicIcon from '@/public/icons/texteditor-italic.svg'
import StrikeIcon from '@/public/icons/texteditor-stikethrough.svg'
import UnderlineIcon from '@/public/icons/texteditor-underline.svg'
import type { Editor } from '@tiptap/core'
import Image from 'next/image'

interface TextStyleBarProps {
  editor: Editor
}

export function TextStyleBar({ editor }: TextStyleBarProps) {
  return (
    <div className="flex items-center">
      <Toggle
        pressed={editor?.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        className="h-9 w-9 p-2"
      >
        <Image src={BoldIcon} alt="Bold" className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        className="h-9 w-9 p-2"
      >
        <Image src={ItalicIcon} alt="Italic" className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        className="h-9 w-9 p-2"
      >
        <Image src={UnderlineIcon} alt="Underline" className="h-5 w-5" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        className="h-9 w-9 p-2"
      >
        <Image src={StrikeIcon} alt="Strikethrough" className="h-6 w-6" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('code')}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        className="h-9 w-9 p-2"
      >
        <Image src={CodeIcon} alt="Code" className="h-6 w-6" />
      </Toggle>
    </div>
  )
}
