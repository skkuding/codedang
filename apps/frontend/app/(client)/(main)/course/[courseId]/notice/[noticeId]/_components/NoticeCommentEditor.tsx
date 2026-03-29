'use client'

import { Button } from '@/components/shadcn/button'
import { useEffect, useRef } from 'react'
import { BiSolidPencil } from 'react-icons/bi'

interface NoticeCommentEditorProps {
  value: string
  setValue: (value: string) => void
  secret: boolean
  setSecret: (value: boolean) => void
  onSubmit: () => void
  onCancel?: () => void
  placeholder: string
  submitText: string
  disabled: boolean
  compact?: boolean
  autoResize?: boolean
}

export function NoticeCommentEditor({
  value,
  setValue,
  secret,
  setSecret,
  onSubmit,
  placeholder,
  compact = false,
  autoResize = false,
  submitText = 'Post',
  disabled = false
}: NoticeCommentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (!autoResize || !textareaRef.current) {
      return
    }

    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }, [value, autoResize])

  return (
    <div
      className={
        compact
          ? 'rounded-xl bg-white py-2'
          : 'rounded-xl border border-[#E5E5E5] bg-white p-6'
      }
    >
      <div className="flex flex-col gap-4">
        <div className={compact ? 'flex items-center gap-2' : 'relative gap-3'}>
          <div
            className={
              compact
                ? 'flex flex-1 items-center justify-between gap-2 rounded-xl border border-[#E5E5E5] px-4 py-[11px]'
                : 'relative gap-3'
            }
          >
            <textarea
              ref={textareaRef}
              rows={compact ? 1 : 6}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              maxLength={1000}
              className={
                compact
                  ? 'h-6 min-h-0 flex-1 resize-none overflow-hidden border-none bg-transparent p-0 text-sm leading-6 placeholder:text-[#C4C4C4] focus:outline-none'
                  : 'min-h-[96px] w-full resize-none text-sm placeholder:text-[#C4C4C4] focus:outline-none'
              }
            />

            {compact && (
              <div className="shrink-0 text-sm text-neutral-300">
                {value.length}/1000
              </div>
            )}

            {!compact && (
              <div className="absolute right-0 text-sm text-neutral-300">
                {value.length}/1000
              </div>
            )}
          </div>

          {compact && (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={disabled}
              className="text-caption2_m_12 flex h-10 rounded-full px-6 py-3"
            >
              <BiSolidPencil className="mr-[6px] h-4 w-4" />
              {submitText}
            </Button>
          )}
        </div>

        <label
          className={`text-caption2_m_12 flex items-center gap-[6px] ${
            secret ? 'text-blue-500' : 'text-neutral-300'
          }`}
        >
          <input
            type="checkbox"
            checked={secret}
            onChange={(e) => setSecret(e.target.checked)}
          />
          Hide from other Students
        </label>

        {!compact && (
          <div className="flex items-center">
            <Button
              type="button"
              onClick={onSubmit}
              disabled={disabled}
              className="text-caption2_m_12 flex h-10 w-full rounded-full px-6 py-3"
            >
              <BiSolidPencil className="mr-[6px] h-4 w-4" />
              {submitText}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
