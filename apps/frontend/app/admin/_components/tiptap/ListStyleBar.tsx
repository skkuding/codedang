import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { Toggle } from '@/components/shadcn/toggle'
import BulletList from '@/public/icons/texteditor-bulletlist.svg'
import LinkIcon from '@/public/icons/texteditor-link.svg'
import NumberedList from '@/public/icons/texteditor-numberedlist.svg'
import type { Editor } from '@tiptap/core'
import { Save as SaveIcon, Trash as TrashIcon } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'

interface ListStyleBarProps {
  editor: Editor
}

export function ListStyleBar({ editor }: ListStyleBarProps) {
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
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => {
          editor.chain().focus().toggleBulletList().run()
          editor.commands.focus()
        }}
        className="h-9 w-9 p-2"
      >
        <Image src={BulletList} alt="Bullet List" className="h-5 w-5" />
      </Toggle>
      <Toggle
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => {
          editor.chain().focus().toggleOrderedList().run()
          editor.commands.focus()
        }}
        className="h-9 w-9 p-2"
      >
        <Image src={NumberedList} alt="Numbered List" className="h-5 w-5" />
      </Toggle>

      <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <Toggle
            type="button"
            pressed={isLinkPopoverOpen}
            onClick={handleSetLink}
            className="h-9 w-9 p-2"
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
