import type { NodeViewWrapperProps } from '@tiptap/react'
import { NodeViewWrapper } from '@tiptap/react'
import katex from 'katex'

export default function MathBlockPreview(props: NodeViewWrapperProps) {
  const content = props.node.attrs.content

  const preview = katex.renderToString(content, {
    throwOnError: false,
    strict: false,
    globalGroup: true
  })

  return (
    <NodeViewWrapper className="math-block-preview" as="span">
      <span
        dangerouslySetInnerHTML={{ __html: preview }}
        contentEditable={false}
      />
    </NodeViewWrapper>
  )
}
