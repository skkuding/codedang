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
export function QnaContentArea({
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
    <div className={`flex flex-col gap-[40px]`}>
      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[14px]">
          <div className="round-full text-color-neutral-60 text-body2_m_14 flex w-fit items-center rounded-xl bg-[#F5F5F5] px-[16px] py-[4px]">
            {`No. ${order}`}
          </div>
          <div className="flex items-center justify-between gap-[20px]">
            <p className="text-head5_sb_24 h-[36px] w-full max-w-[1078px] overflow-hidden truncate">
              {TitleText}
            </p>
            {DeleteButtonComponent}
          </div>
        </div>
        {/* userID & time */}
        <div className="text-body1_m_16 flex flex-col gap-[6px] text-[#787E80]">
          <div className="flex items-center gap-[10px]">
            <div className="size-[16px]">
              <Image src={PersonFillIcon} alt="person" />
            </div>
            <p className="text-body4_r_14">{createdBy?.username}</p>
          </div>
          <div className="flex items-center gap-[10px]">
            <FaClock className="text-color-blue-50" size={13} />
            <div className="text-body4_r_14 flex items-center gap-[4px]">
              <p>{dateFormatter(new Date(createTime), 'YYYY-MM-DD')}</p>
              <p>{dateFormatter(new Date(createTime), 'HH:mm:ss')}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="text-body3_r_16 whitespace-pre-line break-all">
        {content.trim()}
      </div>
    </div>
  )
}
