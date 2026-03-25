'use client'

import { Button } from '@/components/shadcn/button'
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
}

export function NoticeCommentEditor({
  value,
  setValue,
  secret,
  setSecret,
  onSubmit,
  onCancel,
  placeholder,
  submitText,
  disabled
}: NoticeCommentEditorProps) {
  return (
    <div className="mt-4 rounded-xl border border-[#E5E5E5] bg-white p-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          maxLength={1000}
          className="min-h-[96px] w-full resize-none border-none p-0 text-[14px] placeholder:text-[#C4C4C4] focus:outline-none focus:ring-0 focus-visible:ring-0"
        />
        <div className="absolute bottom-0 right-0 text-[13px] text-[#B0B0B0]">
          {value.length}/1000
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-xs text-[#B0B0B0]">
          <input
            type="checkbox"
            checked={secret}
            onChange={(e) => setSecret(e.target.checked)}
          />
          Hide from other Students
        </label>

        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="rounded-full border-[#D9D9D9] px-5 text-sm text-[#808080]"
            >
              Cancel
            </Button>
          )}

          <Button
            type="button"
            onClick={onSubmit}
            disabled={disabled}
            className="flex h-10 rounded-full px-5 text-sm font-medium"
          >
            <BiSolidPencil className="mr-2 h-4 w-4" />
            {submitText}
          </Button>
        </div>
      </div>
    </div>
  )
}
