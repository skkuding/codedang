import type { Editor, Range } from '@tiptap/core'
import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'

export interface CommandProps {
  editor: Editor
  range: { from: number; to: number }
  props: {
    command: (options: CommandProps) => void
    [key: string]: unknown
  }
}

const Commands = Extension.create({
  name: 'slashcommands',
  defaultOptions: {
    suggestion: {
      char: '/',
      startOfLine: false,
      command: ({ editor, range, props }: CommandProps) => {
        props.command({ editor, range, props })
      },
      render: () => ({}),
      items: ({
        query,
        editor
      }: {
        query?: string
        editor?: Editor
      }): {
        title: string
        command: ({ editor, range }: { editor: Editor; range: Range }) => void
      }[] => {
        void query
        void editor
        return []
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
