import { cn } from '@/lib/utils'
import { sanitize } from 'isomorphic-dompurify'

export function WhitespaceVisualizer({
  text = '',
  isTruncated = false,
  className
}: {
  text: string
  isTruncated?: boolean
  className?: string
}) {
  const whitespaceStyle =
    'color: rgb(53, 129, 250); min-width: 0.5em; display: inline-block;'
  const highlightedWhitespaceText = text
    .replaceAll(/ /g, `<span style="${whitespaceStyle}">␣</span>`)
    .replaceAll(/\n/g, `<span style="${whitespaceStyle}">↵</span>\n`)
    .replaceAll(/\t/g, `<span style="${whitespaceStyle}">↹</span>`)

  const lines = highlightedWhitespaceText.split('\n')
  const visibleLines = lines.slice(0, 3).join('\n')
  const truncatedText =
    lines.length > 3
      ? visibleLines + '\n<span style="color: rgb(150, 150, 150);">...</span>'
      : visibleLines

  return (
    <pre
      className={cn(
        'h-24 w-full select-none overflow-auto font-mono text-sm',
        isTruncated && 'overflow-y-hidden',
        className
      )}
      dangerouslySetInnerHTML={{
        __html: sanitize(
          isTruncated ? truncatedText : highlightedWhitespaceText
        )
      }}
    />
  )
}
