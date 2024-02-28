import { mergeAttributes, Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import MathPreview from './MathPreview'

export default Node.create({
  name: 'mathComponent',

  group: 'inline math',

  content: 'text*',

  inline: true,

  defining: true,

  draggable: true,

  selectable: true,

  addAttributes() {
    return {
      content: {
        default: '',
        renderHTML: (attributes) => {
          return {
            content: attributes.content
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'math-component'
      }
    ]
  },

  renderHTML({ HTMLAttributes: htmlAtrributes }) {
    return ['math-component', mergeAttributes(htmlAtrributes, { math: '' }), 0]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathPreview) // Update the type to NodeViewRenderer
  },

  addKeyboardShortcuts() {
    return {}
  }
})
