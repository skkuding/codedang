import katex from 'katex'
import type { RefObject } from 'react'

export const renderKatex = (
  html: string | undefined,
  katexRef: RefObject<HTMLDivElement>
) => {
  if (katexRef.current) {
    katexRef.current.innerHTML = html ?? ''
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
