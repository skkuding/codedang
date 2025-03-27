import type { Range } from '@tiptap/core'
import type { Editor } from '@tiptap/react'

const getSuggestionItems = (
  query: unknown,
  openImageDialog: () => void,
  openFileDialog: () => void,
  openTableDialog: () => void
) => {
  let queryStr = ''

  if (typeof query === 'string') {
    queryStr = query
  } else if (
    query &&
    typeof query === 'object' &&
    'query' in query &&
    typeof (query as { query: unknown }).query === 'string'
  ) {
    queryStr = (query as { query: string }).query
  }

  return [
    {
      title: 'Heading1',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 1 })
          .run()
      }
    },
    {
      title: 'Heading2',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 2 })
          .run()
      }
    },
    {
      title: 'Heading3',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode('heading', { level: 3 })
          .run()
      }
    },
    {
      title: 'Equation',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run()
        editor
          .chain()
          .focus()
          .insertContent(`<math-component content=""></math-component>`)
          .blur()
          .run()
      }
    },
    {
      title: 'CodeBlock',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run()
      }
    },
    {
      title: 'Image',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run()
        openImageDialog()
      }
    },
    {
      title: 'File',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run()
        openFileDialog()
      }
    },
    {
      title: 'Bullet List',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      }
    },
    {
      title: 'Ordered List',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      }
    },
    {
      title: 'Table',
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run()
        openTableDialog()
      }
    }
  ]
    .filter((item) => {
      const queryChars = Array.from(queryStr.toLowerCase())
      const titleChars = item.title.toLowerCase()
      return queryChars.every((char) => titleChars.includes(char))
    })
    .slice(0, 10)
}

export { getSuggestionItems }
