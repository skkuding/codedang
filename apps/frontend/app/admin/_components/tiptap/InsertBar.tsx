import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/shadcn/popover'
import { cn } from '@/libs/utils'
import type { Editor } from '@tiptap/core'
import {
  Heading1 as Heading1Icon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Code as CodeIcon,
  Link as LinkIcon,
  Save as SaveIcon,
  Trash as TrashIcon
} from 'lucide-react'
import { useCallback, useState } from 'react'

interface TextStyleBarProps {
  editor: Editor
}

export function InsertBar({ editor }: TextStyleBarProps) {
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
    <div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          editor.commands.setHeading({ level: 1 })
          editor.commands.focus()
        }}
        className={cn(
          'h-7 w-7 p-1',
          editor.isActive('bold') ? 'bg-gray-200 hover:bg-gray-200' : ''
        )}
      >
        <Heading1Icon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'h-7 w-7 p-1',
          editor.isActive('italic') ? 'bg-gray-200 hover:bg-gray-200' : ''
        )}
      >
        <ItalicIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn(
          'h-7 w-7 p-1',
          editor.isActive('underline') ? 'bg-gray-200 hover:bg-gray-200' : ''
        )}
      >
        <UnderlineIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          'h-7 w-7 p-1',
          editor.isActive('strike') ? 'bg-gray-200 hover:bg-gray-200' : ''
        )}
      >
        <StrikeIcon />
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={cn(
          'h-7 w-7 p-1',
          editor.isActive('code') ? 'bg-gray-200 hover:bg-gray-200' : ''
        )}
      >
        <CodeIcon />
      </Button>
      <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
        <PopoverTrigger>
          <Button
            type="button"
            variant="ghost"
            onClick={handleSetLink}
            className="h-7 w-7 p-1"
          >
            <LinkIcon />
          </Button>
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
            <SaveIcon />
          </Button>
          <Button
            variant="ghost"
            onClick={removeLink}
            disabled={!editor.isActive('link')}
            className="h-7 w-7 p-1"
          >
            <TrashIcon />
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  )
}
