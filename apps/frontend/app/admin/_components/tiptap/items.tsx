import BulletListIcon from '@/public/icons/texteditor-bulletlist.svg'
import CodeBlockIcon from '@/public/icons/texteditor-codeblock.svg'
import EquationIcon from '@/public/icons/texteditor-equation.svg'
import FileIcon from '@/public/icons/texteditor-file.svg'
import Heading1Icon from '@/public/icons/texteditor-h1.svg'
import Heading2Icon from '@/public/icons/texteditor-h2.svg'
import Heading3Icon from '@/public/icons/texteditor-h3.svg'
import ImageIcon from '@/public/icons/texteditor-image.svg'
import NumberedListIcon from '@/public/icons/texteditor-numberedlist.svg'
import TableIcon from '@/public/icons/texteditor-table.svg'
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
      icon: Heading1Icon,
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
      icon: Heading2Icon,
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
      icon: Heading3Icon,
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
      icon: EquationIcon,
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
      icon: CodeBlockIcon,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run()
      }
    },
    {
      title: 'Image',
      icon: ImageIcon,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run()
        openImageDialog()
      }
    },
    {
      title: 'File',
      icon: FileIcon,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run()
        openFileDialog()
      }
    },
    {
      title: 'Bullet List',
      icon: BulletListIcon,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      }
    },
    {
      title: 'Ordered List',
      icon: NumberedListIcon,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run()
      }
    },
    {
      title: 'Table',
      icon: TableIcon,
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
