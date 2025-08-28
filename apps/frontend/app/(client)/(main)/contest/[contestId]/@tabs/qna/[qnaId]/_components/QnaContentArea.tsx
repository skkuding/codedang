import PersonFillIcon from '@/public/icons/person-fill.svg'
import type { GetContestQnaQuery } from '@generated/graphql'
import { format } from 'date-fns'
import Image from 'next/image'
import type { ReactElement } from 'react'
import { FaClock } from 'react-icons/fa6'

const maxTitleLength = 35

/**
 * Qna 상세 페이지의 글 내용 UI 컴포넌트
 * @param QnaData
 * Qna 정보
 * @param canDeleteQna
 * Qna 글 삭제 권한
 * @param DeleteButtonComponent
 * Qna 글 삭제 버튼
 */
export function QnaContentArea({
  QnaData,
  DeleteButtonComponent
}: {
  QnaData: GetContestQnaQuery['getContestQnA']
  DeleteButtonComponent: ReactElement | undefined
}) {
  const { category, title, order, createdBy, createTime, content } = QnaData
  const TitleText = `[${category}] ${title}`

  return (
    <div className={`flex flex-col gap-[40px]`}>
      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[14px]">
          <div className="round-full text-color-neutral-60 flex w-fit items-center rounded-xl bg-[#F5F5F5] px-[16px] py-[4px] text-sm font-medium">
            {`No. ${order}`}
          </div>
          <div className="flex items-center justify-between gap-[20px]">
            <p className="h-[36px] w-full max-w-[1078px] overflow-hidden text-2xl font-semibold">
              {TitleText.length <= maxTitleLength
                ? TitleText
                : TitleText.slice(0, maxTitleLength)}
            </p>
            {DeleteButtonComponent}
          </div>
        </div>
        {/* userID & time */}
        <div className="flex flex-col gap-[6px] font-medium text-[#787E80]">
          <div className="flex items-center gap-[10px]">
            <div className="size-[16px]">
              <Image src={PersonFillIcon} alt="person" />
            </div>
            <p className="text-sm uppercase">{createdBy?.username}</p>
          </div>
          <div className="flex items-center gap-[10px]">
            <FaClock className="text-color-blue-50" size={13} />
            <div className="flex items-center gap-[4px] text-sm">
              <p>{format(createTime ? createTime : 0, 'yyyy-MM-dd')}</p>
              <p>{format(createTime ? createTime : 0, 'HH:mm:ss')}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="whitespace-pre-line font-normal">{content.trim()}</div>
    </div>
  )
}
