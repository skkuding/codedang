export interface HtmlAttribute {
  name: string
  value: string
}

const isAsciiLetter = (char: string) => /^[a-z]$/i.test(char)
const isWhitespace = (char: string) => /^[\t\n\f\r ]$/.test(char)

/**
 * Yields the attributes of every start tag in one linear pass, following the
 * browser tokenizer where it matters for attachment references: quotes only
 * delimit a value right after "=", comments (ending in "-->" or "--!>", or the
 * empty "<!-->" and "<!--->") and end tags are skipped, and an
 * unterminated tag ends parsing because the browser drops it with the rest.
 */
export const readHtmlAttributes = function* (
  html: string
): Generator<HtmlAttribute> {
  const length = html.length
  let i = 0

  // Next known position of each comment ending; reused while it is still
  // ahead of the cursor so repeated comments keep the scan linear.
  const commentEnds = [
    { token: '-->', at: -2 },
    { token: '--!>', at: -2 }
  ]
  const findCommentEnd = (from: number) => {
    let end = -1
    for (const commentEnd of commentEnds) {
      if (commentEnd.at !== -1 && commentEnd.at < from) {
        commentEnd.at = html.indexOf(commentEnd.token, from)
      }
      if (commentEnd.at !== -1) {
        const after = commentEnd.at + commentEnd.token.length
        end = end === -1 ? after : Math.min(end, after)
      }
    }
    return end
  }

  while (i < length) {
    const start = html.indexOf('<', i)
    if (start === -1) return
    const next = html[start + 1] ?? ''

    if (html.startsWith('<!--', start)) {
      const body = start + 4
      // "<!-->" and "<!--->" close the comment right away in browsers
      if (html[body] === '>') {
        i = body + 1
        continue
      }
      if (html.startsWith('->', body)) {
        i = body + 2
        continue
      }
      const end = findCommentEnd(body)
      if (end === -1) return
      i = end
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
