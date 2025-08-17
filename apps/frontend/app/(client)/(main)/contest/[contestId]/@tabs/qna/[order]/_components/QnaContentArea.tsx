import PersonFillIcon from '@/public/icons/person-fill.svg'
import { format } from 'date-fns'
import Image from 'next/image'
import { FaClock } from 'react-icons/fa6'
import type { QnaContent } from '../page'
import { DeleteButton } from './DeleteButton'

const maxTitleLength = 35

export function QnaContentArea({
  data,
  className,
  canDelete
}: {
  data: QnaContent
  className: string
  canDelete: boolean
}) {
  const TitleText = `[${data.category}] ${data.title}`

  return (
    <div className={`flex flex-col gap-[40px] ${className}`}>
      {/* header 부분 */}
      <div className="flex flex-col gap-[12px]">
        {/* No. & 제목 */}
        <div className="flex flex-col gap-[14px]">
          <div className="round-full text-color-neutral-60 flex w-fit items-center rounded-xl bg-[#F5F5F5] px-[16px] py-[4px] text-sm font-medium">
            {`No. ${data.order}`}
          </div>
          <div className="flex items-center justify-between gap-[20px]">
            {/* TODO: 글자 수 초과 로직 컨펌 */}
            <p className="h-[36px] w-full max-w-[1078px] overflow-hidden text-2xl font-semibold">
              {TitleText.length <= maxTitleLength
                ? TitleText
                : TitleText.slice(0, maxTitleLength)}
            </p>
            {canDelete && <DeleteButton subject="question" />}
          </div>
        </div>
        {/* userID & time */}
        <div className="flex flex-col gap-[6px] font-medium text-[#787E80]">
          <div className="flex items-center gap-[10px]">
            <div className="size-[16px]">
              <Image src={PersonFillIcon} alt="person" />
            </div>
            <p className="text-sm uppercase">{data.createdBy?.username}</p>
          </div>
          <div className="flex items-center gap-[10px]">
            <FaClock className="text-color-blue-50" size={13} />
            <div className="flex items-center gap-[4px] text-sm">
              <p>
                {format(data.createTime ? data.createTime : 0, 'yyyy-MM-dd')}
              </p>
              <p>{format(data.createTime ? data.createTime : 0, 'HH:mm:ss')}</p>
            </div>
          </div>
        </div>
      </div>
      {/* content 부분 */}
      <div className="whitespace-pre-line font-normal">
        {data.content?.trim()}
      </div>
    </div>
  )
}
