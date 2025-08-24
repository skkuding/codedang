'use client'

import { fetcherWithAuth } from '@/libs/utils'
import { useParams } from 'next/navigation'

const [contestId, qnaId] = [params.contestId, params.qnaId]

export const HandleDeleteContent = async () => {
  const params = useParams()

  try {
    const res = await fetcherWithAuth.delete(
      `contest/${contestId}/qna/${qnaId}`
    )
    if (!res.ok) {
      const errorRes: { message: string } = await res.json()
      toast.error(errorRes.message)
    } else {
      toast.success('Qna is deleted successfully!')
    }
    // TODO: status code에 따라 에러 구현
  } catch (error) {
    toast.error(`Error in deleting qna!: ${error}`)
  }
}
