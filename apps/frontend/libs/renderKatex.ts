import DOMPurify from 'isomorphic-dompurify'
import katex from 'katex'
import type { RefObject } from 'react'

export const renderKatex = (
  html: string | undefined,
  katexRef: RefObject<HTMLDivElement | null>
) => {
  if (katexRef.current) {
    katexRef.current.innerHTML = DOMPurify.sanitize(html ?? '', {
      ADD_TAGS: ['math-component'],
      ADD_ATTR: ['content']
    })
    const div = katexRef.current
    div.querySelectorAll('math-component').forEach((el) => {
      const content = el.getAttribute('content') || ''
      const mathHtml = katex.renderToString(content, {
        throwOnError: false,
        strict: false,
        globalGroup: true,
        output: 'mathml'
      })
      el.outerHTML = mathHtml
    })
  }
}
