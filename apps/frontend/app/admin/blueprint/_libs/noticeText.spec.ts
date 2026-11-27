// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { getNoticePlainText } from './noticeText'

describe('Notice plain text outside the browser', () => {
  it.each([
    ['', ''],
    [
      '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>',
      'HeaderCell'
    ],
    ['<p>A &amp; &#66; &#x43;</p>', 'A & B C'],
    ['<span title="a > b">text</span>', 'text'],
    [
      '<p>before</p><!--hidden--><script>alert(1)</script><style>p { color: red }</style><p>after</p>',
      'beforeafter'
    ],
    ['<p>&lt;script&gt;literal&lt;/script&gt;</p>', '<script>literal</script>'],
    ['<p>&amp;lt;b&amp;gt;</p>', '&lt;b&gt;']
  ])('extracts text from %j', (html, text) => {
    expect(getNoticePlainText(html)).toBe(text)
  })

  it('decodes whitespace entities without treating them as body text', () => {
    expect(
      getNoticePlainText('<p>&nbsp;&#160;&#xA0;&#9;&#10;</p>').trim()
    ).toBe('')
  })
})
