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
  placeholder: string
  submitText: string
  disabled: boolean
  compact?: boolean
  autoResize?: boolean
  isReplyEdit?: boolean
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
  disabled = false,
  isReplyEdit = false
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
          ? `rounded-xl ${isReplyEdit ? 'bg-color-neutral-99' : 'bg-white'}`
          : 'border-color-neutral-95 rounded-xl border bg-white p-6'
      }
    >
      <div className="flex flex-col">
        <div className={compact ? 'flex items-center gap-2' : 'relative gap-3'}>
          <div
            className={
              compact
                ? 'border-color-neutral-95 flex flex-1 items-center justify-between gap-2 rounded-xl border px-4 py-[11px]'
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
                  ? 'text-body1_m_16 placeholder:text-color-neutral-90 h-6 min-h-0 flex-1 resize-none overflow-hidden border-none bg-transparent p-0 focus:outline-none'
                  : 'text-body1_m_16 placeholder:text-color-neutral-90 min-h-[96px] w-full resize-none focus:outline-none'
              }
            />

            {compact && (
              <div className="text-caption1_m_13 text-color-cool-neutral-50 shrink-0">
                {value.length}/1000
              </div>
            )}

            {!compact && (
              <div className="text-caption1_m_13 text-color-neutral-90 absolute right-0">
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
          className={`text-caption2_m_12 flex items-center gap-[6px] ${compact ? 'mt-2' : 'mt-3'} ${
            secret ? 'text-primary' : 'text-color-neutral-80'
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
          <div className="mt-4 flex items-center gap-2">
            <Button
              type="button"
              onClick={onSubmit}
              disabled={disabled}
              className="text-caption2_m_12 flex h-10 flex-1 rounded-full px-6 py-3"
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
