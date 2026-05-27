import { dateFormatter } from '@/libs/utils'
import PersonFillIcon from '@/public/icons/person-fill.svg'
import type { GetContestQnaQuery } from '@generated/graphql'
import Image from 'next/image'
import type { ReactElement } from 'react'
import { FaClock } from 'react-icons/fa6'

/**
 * Qna 상세 페이지의 글 내용 UI 컴포넌트
 * @param QnaData
 * Qna 정보
 * @param canDeleteQna
 * Qna 글 삭제 권한
 * @param DeleteButtonComponent
 * Qna 글 삭제 버튼
 */
export function AdminQnaContentArea({
  QnaData,
  categoryName,
  DeleteButtonComponent
}: {
  QnaData: GetContestQnaQuery['getContestQnA']
  categoryName: string
  DeleteButtonComponent: ReactElement | undefined
}) {
  const { title, order, createdBy, createTime, content } = QnaData
  const TitleText = `[${categoryName}] ${title}`

  return (
    <div className="flex flex-col gap-[20px]">
      {/* TITLE */}
      <div className="border-line flex flex-col gap-[16px] border-b-[1px] pb-[20px]">
        <div className="flex flex-col gap-[4px]">
          <div className="round-full text-color-neutral-60 bg-color-neutral-99 flex w-fit items-center rounded-xl px-[16px] py-[4px] text-sm font-medium">
            {`No. ${order}`}
          </div>
          <div className="flex items-center justify-between gap-[20px]">
            <p className="max-h-[70px] max-w-[608px] overflow-hidden text-2xl font-semibold">
              {TitleText}
            </p>
            {DeleteButtonComponent}
          </div>
        </div>
        {/* userID & time */}
        <div className="flex flex-col gap-[6px] font-medium text-[#787E80]">
          <div className="flex items-center gap-[10px]">
            <div className="size-[13.5px]">
              <Image src={PersonFillIcon} alt="person" />
            </div>
            <p className="text-sm">{createdBy?.username}</p>
          </div>
          <div className="flex items-center gap-[10px]">
            <FaClock className="text-color-blue-50" size={13.5} />
            <div className="flex items-center gap-[4px] text-sm">
              <p>{dateFormatter(new Date(createTime), 'YYYY-MM-DD')}</p>
              <p>{dateFormatter(new Date(createTime), 'HH:mm:ss')}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="whitespace-pre-line break-all px-[16px] text-base font-normal">
        {content.trim()}
      </div>
    </div>
  )
}
