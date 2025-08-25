import { fetcherWithAuth } from '@/libs/utils'
import type { MultipleQnaData, SingleQnaData } from '@/types/type'
import Image from 'next/image'
import { FaCircleExclamation } from 'react-icons/fa6'
import { QnaAccordion } from './QnaAccordion'

export const revalidate = 0

interface QuestionAnswerAreaProps {
  contestId: number
  problemId: number
}

export async function QuestionAnswerArea({
  contestId,
  problemId
}: QuestionAnswerAreaProps) {
  try {
    const allqnaData = await fetcherWithAuth
      .get(`contest/${contestId}/qna`, { cache: 'no-store' })
      .json<MultipleQnaData[]>()

    const filtered = allqnaData
      .filter((qna) => qna.problemId === problemId)
      .sort((a, b) => a.order - b.order)

    if (!filtered.length) {
      return (
        <div className="mx-5 mb-[38px] mt-5 flex flex-col items-center justify-center gap-[6px] rounded-lg bg-[#121728] px-5 pb-10 pt-[30px] text-center font-sans text-[#787E80]">
          <div className="text-[#787E80]">
            <FaCircleExclamation className="h-[30px] w-[30px]" />
          </div>
          <p className="m-0 text-base">Question not registered</p>
        </div>
      )
    }

    const qnaDetails = await Promise.all(
      filtered.map(({ order }) =>
        fetcherWithAuth
          .get(`contest/${contestId}/qna/${order}`, { cache: 'no-store' })
          .json<SingleQnaData>()
      )
    )

    return <QnaAccordion qnaData={qnaDetails} />
  } catch (error) {
    console.error('API 호출 중 오류가 발생했습니다:', error)
    return (
      <div className="mx-5 mb-[38px] mt-5 flex flex-col items-center justify-center gap-[6px] rounded-lg bg-[#121728] px-5 pb-10 pt-[30px] text-center font-sans text-[#787E80]">
        <div className="text-[#787E80]">
          <FaCircleExclamation className="h-[30px] w-[30px]" />
        </div>
        <p className="m-0 text-base">Something Wrong... Try Again!</p>
        <Image src={'/logos/error.webp'} alt="error" width={150} height={150} />
      </div>
    )
  }
}
