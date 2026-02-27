import { Button } from '@/components/shadcn/button'
import { Textarea } from '@/components/shadcn/textarea'
import { useTranslate } from '@tolgee/react'
import type { Dispatch, SetStateAction } from 'react'
import { BiSolidPencil } from 'react-icons/bi'

export function AdminCommentPostArea({
  username,
  text,
  setText,
  onPost
}: {
  username?: string
  text: string
  setText: Dispatch<SetStateAction<string>>
  onPost: () => void
}) {
  const { t } = useTranslate()

  return (
    <div className="border-line-default flex flex-col gap-[16px] rounded-xl border border-solid p-[24px]">
      {/* 작성자 이름과 input field */}
      <div className="flex flex-col gap-[8px]">
        <span className="text-xl font-medium">{username}</span>
        <div className="flex flex-col gap-[15px]">
          <Textarea
            value={text}
            className="placeholder:text-color-neutral-90 min-h-[72px] resize-none whitespace-pre-wrap rounded-none border-none p-0 text-base shadow-none focus-visible:ring-0"
            placeholder={t('enter_your_answer_placeholder')}
            onChange={(value) => setText(value.target.value)}
            maxLength={400}
          />
          <div className="text-color-neutral-90 text-abse right-0 flex justify-end font-medium">
            <span className="px-[10px]">{`${text.length}/400`}</span>
          </div>
        </div>
      </div>
      {/* Post Button */}
      <Button
        type="submit"
        disabled={text.length === 0}
        onClick={() => onPost()}
        className="flex h-[46px] w-full cursor-pointer items-center justify-center gap-[6px]"
      >
        <BiSolidPencil className="white" />
        <p className="text-base font-medium text-white">{t('post_button')}</p>
      </Button>
    </div>
  )
}
