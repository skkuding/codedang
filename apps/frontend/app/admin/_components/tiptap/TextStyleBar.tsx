import { Toggle } from '@/components/shadcn/toggle'
import BoldIcon from '@/public/icons/texteditor-bold.svg'
import CodeIcon from '@/public/icons/texteditor-code.svg'
import ItalicIcon from '@/public/icons/texteditor-italic.svg'
import StrikeIcon from '@/public/icons/texteditor-stikethrough.svg'
import UnderlineIcon from '@/public/icons/texteditor-underline.svg'
import type { Editor } from '@tiptap/core'

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
        <BoldIcon className="size-5" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        className="h-9 w-9 p-2"
      >
        <ItalicIcon className="size-5" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        className="h-9 w-9 p-2"
      >
        <UnderlineIcon className="h-5 w-5" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        className="h-9 w-9 p-2"
      >
        <StrikeIcon className="size-5" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('code')}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        className="h-9 w-9 p-2"
      >
        <CodeIcon className="size-5" />
      </Toggle>
    </div>
  )
}
