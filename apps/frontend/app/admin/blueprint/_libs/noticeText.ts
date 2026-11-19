import DOMPurify from 'isomorphic-dompurify'

export function getNoticePlainText(content: string): string {
  const fragment = DOMPurify.sanitize(content, {
    FORBID_TAGS: ['style'],
    ALLOWED_ATTR: [],
    RETURN_DOM_FRAGMENT: true
  })
  return fragment.textContent ?? ''
}
