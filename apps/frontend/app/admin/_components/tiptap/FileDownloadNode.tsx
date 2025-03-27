import { Node, mergeAttributes } from '@tiptap/core'

export const FileDownloadNode = Node.create({
  name: 'fileDownload',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      href: {
        default: null
      },
      fileName: {
        default: 'File'
      }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-file-download]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-file-download': '',
        class: 'file-download'
      }),
      ['span', { class: 'pdf-icon' }, '📄'],
      [
        'a',
        { href: node.attrs.href, target: '_blank', class: 'file-link' },
        node.attrs.fileName
      ]
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const container = document.createElement('div')
      container.classList.add('file-download')

      const icon = document.createElement('span')
      icon.classList.add('pdf-icon')
      icon.textContent = '📄'

      const link = document.createElement('a')
      link.classList.add('file-link')
      link.href = node.attrs.href
      link.target = '_blank'
      link.textContent = node.attrs.fileName

      container.appendChild(icon)
      container.appendChild(link)

      return { dom: container }
    }
  }
})
