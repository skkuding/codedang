import { cn } from '@/libs/utils'
import * as React from 'react'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        const target = event.target as HTMLTextAreaElement
        const start = target.selectionStart
        const end = target.selectionEnd

        // Insert 2 spaces at the current cursor position
        target.value = `${target.value.substring(0, start)}  ${target.value.substring(end)}`

        // Move the cursor 2 characters forward
        target.selectionStart = target.selectionEnd = start + 2
      }
    }
    return (
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300',
          className
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
