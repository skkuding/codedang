import { cn } from '@/libs/utils'
import type { QnAComment } from '@/types/type'
import { FaCircleExclamation } from 'react-icons/fa6'
import { IoPersonCircle } from 'react-icons/io5'

type BaseComment = QnAComment

type Comment = BaseComment & {
  isCourseStaff?: boolean
  isContestStaff?: boolean
}
interface CommentsAreaProps {
  comments: Comment[]
}

export function CommentsArea({ comments }: CommentsAreaProps) {
  const sortedComments = [...comments].sort((a, b) => a.order - b.order)
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 bg-[#121728] px-5 pt-5">
      {sortedComments && sortedComments.length > 0 ? (
        sortedComments.map((comment) => {
          const isStaff = comment.isCourseStaff || comment.isContestStaff
          return (
            <div
              key={comment.id}
              className={cn(
                'border-1 rounded-lg border-[#FFFFFF33] px-5 py-2',
                isStaff && 'bg-[#FFFFFF0F]'
              )}
            >
              {isStaff && (
                <div className="text-color-neutral-70 mb-2 flex items-center justify-start gap-2 text-sm font-semibold">
                  <IoPersonCircle className="h-6 w-6" />
                  <span className="text-sm font-semibold">
                    {comment.createdBy?.username || 'Staff'}
                  </span>
                </div>
              )}
              <div className="whitespace-pre-wrap break-all text-base text-white">
                {comment.content}
              </div>
            </div>
          )
        })
      ) : (
        <div className="flex min-h-[180px] w-full flex-1 flex-col items-center justify-center gap-2 bg-[#121728] py-10 text-gray-400">
          <div className="text-[#787E80]">
            <FaCircleExclamation className="h-[30px] w-[30px]" />
          </div>
          Answer not registered
        </div>
      )}
    </div>
  )
}
