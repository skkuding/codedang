import { cn } from '@/libs/utils'
import type { SingleQnaData } from '@/types/type'
import { useTranslate } from '@tolgee/react'
import { FaCircleExclamation } from 'react-icons/fa6'
import { IoPersonCircle } from 'react-icons/io5'

type Comments = SingleQnaData['comments']

interface CommentsAreaProps {
  comments: Comments
}

export function CommentsArea({ comments }: CommentsAreaProps) {
  const { t } = useTranslate()
  comments.sort((a, b) => a.order - b.order)
  return (
    <div className="flex h-full flex-col gap-2 bg-[#121728] px-5 pt-5">
      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div
            key={comment.id}
            className={cn(
              'border-1 rounded-lg border-[#FFFFFF33] px-5 py-2',
              comment.isContestStaff && 'bg-[#FFFFFF0F]'
            )}
          >
            {comment.isContestStaff && (
              <div className="text-color-neutral-70 mb-2 flex items-center justify-start gap-2 text-sm font-semibold">
                <IoPersonCircle className="h-6 w-6" />
                <span className="text-sm font-semibold">
                  {comment.createdBy.username}
                </span>
              </div>
            )}
            <div className="whitespace-pre-wrap break-all text-base text-white">
              {comment.content}
            </div>
          </div>
        ))
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#121728] text-gray-400">
          <div className="text-[#787E80]">
            <FaCircleExclamation className="h-[30px] w-[30px]" />
          </div>
          {t('answer_not_registered')}
        </div>
      )}
    </div>
  )
}
