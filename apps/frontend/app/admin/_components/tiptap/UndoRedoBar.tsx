import Redo from '@/public/icons/texteditor-redo.svg'
import Undo from '@/public/icons/texteditor-undo.svg'
import type { Editor } from '@tiptap/react'
import Image from 'next/image'

interface UndoRedoBarProps {
  editor: Editor
}

export function UndoRedoBar({ editor }: UndoRedoBarProps) {
  const canUndo = editor.can().undo()
  const canRedo = editor.can().redo()

  return (
    <div className="flex">
      <button
        type="button"
        aria-label="Undo"
        disabled={!canUndo}
        onClick={() => {
          editor.commands.undo()
        }}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md align-middle hover:bg-gray-100"
      >
        <Image src={Undo} alt="Undo" className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label="Redo"
        disabled={!canRedo}
        onClick={() => {
          editor.commands.redo()
        }}
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md align-middle hover:bg-gray-100"
      >
        <Image src={Redo} alt="Redo" className="h-4 w-4" />
      </button>
    </div>
  )
}
