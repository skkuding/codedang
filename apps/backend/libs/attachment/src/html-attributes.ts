export interface HtmlAttribute {
  name: string
  value: string
}

const isAsciiLetter = (char: string) => /^[a-z]$/i.test(char)
const isWhitespace = (char: string) => /^[\t\n\f\r ]$/.test(char)

/**
 * Yields the attributes of every start tag in one linear pass, following the
 * browser tokenizer where it matters for attachment references: quotes only
 * delimit a value right after "=", comments and end tags are skipped, and an
 * unterminated tag ends parsing because the browser drops it with the rest.
 */
export const readHtmlAttributes = function* (
  html: string
): Generator<HtmlAttribute> {
  const length = html.length
  let i = 0

  while (i < length) {
    const start = html.indexOf('<', i)
    if (start === -1) return
    const next = html[start + 1] ?? ''

    if (html.startsWith('<!--', start)) {
      const end = html.indexOf('-->', start + 4)
      if (end === -1) return
      i = end + 3
      continue
    }
    if (next === '!' || next === '?') {
      const end = html.indexOf('>', start + 2)
      if (end === -1) return
      i = end + 1
      continue
    }

    const isEndTag = next === '/' && isAsciiLetter(html[start + 2] ?? '')
    if (!isEndTag && !isAsciiLetter(next)) {
      i = start + 1
      continue
    }

    i = start + (isEndTag ? 2 : 1)
    while (i < length && !isWhitespace(html[i]) && !'/>'.includes(html[i])) i++

    const attributes: HtmlAttribute[] = []
    let closed = false
    while (i < length) {
      const char = html[i]
      if (char === '>') {
        closed = true
        i++
        break
      }
      if (isWhitespace(char) || char === '/') {
        i++
        continue
      }

      const nameStart = i
      i++
      while (i < length && !isWhitespace(html[i]) && !'/>='.includes(html[i]))
        i++
      const name = html.slice(nameStart, i).toLowerCase()

      let j = i
      while (j < length && isWhitespace(html[j])) j++
      if (html[j] !== '=') {
        attributes.push({ name, value: '' })
        continue
      }

      i = j + 1
      while (i < length && isWhitespace(html[i])) i++
      const quote = html[i]
      if (quote === '"' || quote === "'") {
        const end = html.indexOf(quote, i + 1)
        if (end === -1) return
        attributes.push({ name, value: html.slice(i + 1, end) })
        i = end + 1
      } else {
        const valueStart = i
        while (i < length && !isWhitespace(html[i]) && html[i] !== '>') i++
        attributes.push({ name, value: html.slice(valueStart, i) })
      }
    }

    if (!closed) return
    if (!isEndTag) yield* attributes
  }
}
