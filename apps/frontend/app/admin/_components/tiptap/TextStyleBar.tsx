import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { Toggle } from '@/components/shadcn/toggle'
import BoldIcon from '@/public/icons/texteditor-bold.svg'
import CodeIcon from '@/public/icons/texteditor-code.svg'
import ItalicIcon from '@/public/icons/texteditor-italic.svg'
import LinkIcon from '@/public/icons/texteditor-link.svg'
import StrikeIcon from '@/public/icons/texteditor-stikethrough.svg'
import UnderlineIcon from '@/public/icons/texteditor-underline.svg'
import type { Editor } from '@tiptap/core'
import { Save as SaveIcon, Trash as TrashIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'

interface TextStyleBarProps {
  editor: Editor
}

export function TextStyleBar({ editor }: TextStyleBarProps) {
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const handleSetLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    setLinkUrl(previousUrl || '')
    setIsLinkPopoverOpen(true)
  }, [editor])

  const saveLink = useCallback(() => {
    if (linkUrl === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor
        ?.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run()
    }

    setIsLinkPopoverOpen(false)
  }, [editor, linkUrl])

  const removeLink = useCallback(() => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    setIsLinkPopoverOpen(false)
  }, [editor])

  return (
    <div className="flex items-center">
      <Toggle
        pressed={editor?.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        className="h-9 w-9 p-1"
      >
        <Image src={BoldIcon} alt="Bold" className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        className="h-9 w-9 p-1"
      >
        <Image src={ItalicIcon} alt="Italic" className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('underline')}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        className="h-9 w-9 p-1"
      >
        <Image src={UnderlineIcon} alt="Underline" className="h-5 w-5" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        className="h-9 w-9 p-1"
      >
        <Image src={StrikeIcon} alt="Strikethrough" className="h-6 w-6" />
      </Toggle>
      <Toggle
        pressed={editor?.isActive('code')}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        className="h-9 w-9 p-1"
      >
        <Image src={CodeIcon} alt="Code" className="h-6 w-6" />
      </Toggle>
      <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <Toggle
            type="button"
            pressed={isLinkPopoverOpen}
            onClick={handleSetLink}
            className="h-9 w-9 p-1"
            aria-haspopup="dialog"
            aria-expanded={isLinkPopoverOpen}
          >
            <Image src={LinkIcon} alt="Link" className="h-4 w-4" />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="flex gap-2 rounded-lg border bg-white p-2">
          <Input
            type="url"
            className="h-8"
            placeholder="Enter URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
          />
          <Button variant="ghost" onClick={saveLink} className="h-7 w-7 p-1">
            <SaveIcon className="text-neutral-600" />
          </Button>
          <Button
            variant="ghost"
            onClick={removeLink}
            disabled={!editor.isActive('link')}
            className="h-7 w-7 p-1"
          >
            <TrashIcon className="text-neutral-600" />
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
