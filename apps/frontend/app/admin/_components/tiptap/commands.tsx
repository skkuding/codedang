import type { Editor } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

interface CommandProps {
  editor: Editor
  range: { from: number; to: number }
  props: {
    command: (options: CommandProps) => void
    [key: string]: unknown
  }
}

const Commands = Extension.create({
  name: 'mention',
  defaultOptions: {
    suggestion: {
      char: '/',
      startOfLine: false,
      command: ({ editor, range, props }: CommandProps) => {
        props.command({ editor, range, props })
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion
      })
    ]
  }
})

export { Commands }
