'use client'

import { fetcherWithAuth } from '@/libs/utils'
import type { MultipleQnaData, SingleQnaData } from '@/types/type'
import { useState, useEffect } from 'react'
import { FaCircleExclamation } from 'react-icons/fa6'
import { QnaAccordion } from './QnaAccordion'

//뭘 받아야 하지...
//일단 contestId, problemId 둘다 number
//그러면 /contest/3/qna로 다 받아온다음에 problemId로 필터링. 몇 문제 남았겠지? 그럼 거기서 order 추출해서 /contest/3/qna/3 하면됨.
//사실 받을 필요없는데 그래도 받으면 좋자나
//만약에 필터링 했는데 문제가 없으면 없다고 표시, 잇으면 문제당 아코디언으로 만들어줌.
//그담에 /contest/3/qna/3/comment 해서 댓글달게 하면 됨
//먼저 질문 보여주고, 그담에 댓글 보여줄 예정. 질문자가 작성한 comment와 관리자가 작성한 comment는 따로 구분해야함.

interface QuestionAnswerAreaProps {
  contestId: number
  problemId: number
}

export function QuestionAnswerArea({
  contestId,
  problemId
}: QuestionAnswerAreaProps) {
  const [dataExsist, setDataExsist] = useState(false)
  const [qnaDetails, setQnaDetails] = useState<SingleQnaData[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const fetchQnaData = async () => {
      try {
        const allqnaData: MultipleQnaData[] = await fetcherWithAuth
          .get(`contest/${contestId}/qna`)
          .json()

        const filteredData = allqnaData.filter(
          (qna) => qna.problemId === problemId
        )

        if (filteredData && filteredData.length > 0) {
          setDataExsist(true)

          const orders = filteredData.map((item) => item.order)
          const promises = orders.map(async (order) => {
            const res: SingleQnaData = await fetcherWithAuth
              .get(`contest/${contestId}/qna/${order}`)
              .json()
            return res
          })

          const results = await Promise.all(promises)
          setQnaDetails(results)
        } else {
          setDataExsist(false)
        }
      } catch (error) {
        console.error('API 호출 중 오류가 발생했습니다:', error)
        setDataExsist(false)
      } finally {
        setLoading(false)
      }
    }

    fetchQnaData()
  }, [contestId, problemId])

  if (loading) {
    return <div>Loading...</div>
  }
  if (!dataExsist) {
    return (
      <div className="mx-5 mb-[38px] mt-5 flex flex-col items-center justify-center gap-[6px] rounded-lg bg-[#121728] px-5 pb-10 pt-[30px] text-center font-sans text-[#787E80]">
        <div className="text-[#787E80]">
          <FaCircleExclamation className="h-[30px] w-[30px]" />
        </div>
        <p className="m-0 text-base">Question not registered</p>
      </div>
    )
  }
  console.log('QnA Details:', qnaDetails)

  return <QnaAccordion qnaData={qnaDetails} />
}
