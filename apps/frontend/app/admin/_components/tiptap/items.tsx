import BulletList from '@/public/icons/texteditor-bulletlist.svg'
import CodeBlock from '@/public/icons/texteditor-codeblock.svg'
import SquareRadical from '@/public/icons/texteditor-equation.svg'
import Paperclip from '@/public/icons/texteditor-file.svg'
import Heading1 from '@/public/icons/texteditor-h1.svg'
import Heading2 from '@/public/icons/texteditor-h2.svg'
import Heading3 from '@/public/icons/texteditor-h3.svg'
import ImagePlus from '@/public/icons/texteditor-image.svg'
import NumberedList from '@/public/icons/texteditor-numberedlist.svg'
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
      icon: Heading1,
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
      icon: Heading2,
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
      icon: Heading3,
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
      icon: SquareRadical,
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
      icon: CodeBlock,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run()
      }
    },
    {
      title: 'Image',
      icon: ImagePlus,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run()
        openImageDialog()
      }
    },
    {
      title: 'File',
      icon: Paperclip,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).run()
        openFileDialog()
      }
    },
    {
      title: 'Bullet List',
      icon: BulletList,
      command: ({ editor, range }: { editor: Editor; range: Range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run()
      }
    },
    {
      title: 'Ordered List',
      icon: NumberedList,
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
