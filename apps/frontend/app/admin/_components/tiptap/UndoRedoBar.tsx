import { Button } from '@/components/shadcn/button'
import Redo from '@/public/icons/texteditor-redo.svg'
import Undo from '@/public/icons/texteditor-undo.svg'
import type { Editor } from '@tiptap/react'
import Image from 'next/image'

interface UndoRedoBarProps {
  editor: Editor
}

export function UndoRedoBar({ editor }: UndoRedoBarProps) {
  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        type="button"
        className="h-9 w-9 p-1"
        disabled={!editor.can().undo()}
        onClick={() => {
          editor.commands.undo()
        }}
      >
        <Image src={Undo} alt="Undo" className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        type="button"
        className="h-9 w-9 p-1"
        disabled={!editor.can().redo()}
        onClick={() => {
          editor.commands.redo()
        }}
      >
        <Image src={Redo} alt="Redo" className="h-4 w-4" />
      </Button>
    </div>
  )
}
